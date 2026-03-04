import _ from "lodash";
import pMemoize from "p-memoize";
import { createFFmpegInstance } from "./ffmpegCore";
import type { SoundAssetsMetadata } from "./types";
import { updateSongFile } from "./SongFile";
import { NotechartLoader } from "@mikuroxina/bemuse-notechart/lib/loader";
import type { LogEvent } from "@ffmpeg/ffmpeg";

export async function renderSongInDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  chartFilename: string,
  soundAssetsMetadata: SoundAssetsMetadata,
  log: (message: string) => void,
) {
  const chartHandle = await directoryHandle.getFileHandle(chartFilename);
  const chartFile = await chartHandle.getFile();
  const chartData = await chartFile.arrayBuffer();
  const dataDir = await directoryHandle.getDirectoryHandle("bemuse-data");
  const soundDir = await dataDir.getDirectoryHandle("sound");
  const { replayGain, ogg } = await renderChart({
    chartData,
    chartFilename,
    loadBemusepack: async (path) => {
      const fileHandle = await soundDir.getFileHandle(path);
      const file = await fileHandle.getFile();
      const data = await file.arrayBuffer();
      return data;
    },
    soundAssetsMetadata,
    log,
  });
  const oggHandle = await dataDir.getFileHandle("song.ogg", { create: true });
  const writable = await oggHandle.createWritable();
  await writable.write(ogg);
  await writable.close();
  await updateSongFile(directoryHandle, (song) => {
    return {
      ...song,
      replaygain: replayGain + " dB",
    };
  });
}

export type RenderOptions = {
  soundAssetsMetadata: SoundAssetsMetadata;
  chartData: ArrayBuffer;
  chartFilename: string;
  loadBemusepack: (path: string) => Promise<ArrayBuffer>;
  log?: (text: string) => void;
};

export async function renderChart(options: RenderOptions) {
  const {
    soundAssetsMetadata,
    chartData,
    chartFilename,
    log = console.log,
  } = options;

  const keysounds: Record<string, AudioBuffer> = {};
  const loadRef = pMemoize(async (refId: number) => {
    const path = soundAssetsMetadata.refs[refId].path;
    log(`Loading ${path}`);
    return options.loadBemusepack(path);
  });
  const loadCtx = new OfflineAudioContext(2, 1, 44100);
  for (const file of soundAssetsMetadata.files) {
    try {
      const pack = await loadRef(file.ref[0]);
      const audioBuffer = await loadCtx.decodeAudioData(
        pack.slice(file.ref[1] + 14, file.ref[2] + 14),
      );
      log(`Decoded ${file.name}`);
      keysounds[file.name.toLowerCase()] = audioBuffer;
    } catch (error) {
      log(`Failed to decode ${file.name}: ${error}`);
      console.error(error);
    }
  }
  const getAudioBuffer = (path: string) =>
    (path && keysounds[path.toLowerCase()]) || undefined;

  log("Getting notes...");
  const song = await getNotes(chartData, chartFilename, {
    exists: (path) => !!getAudioBuffer(path),
  });
  const validNotes = song.data.flatMap((note) => {
    const buffer = getAudioBuffer(note.src ?? "");
    return buffer ? [{ ...note, buffer }] : [];
  });
  log(`Number of valid notes: ${validNotes.length}`);
  let totalDuration = 0;
  for (const note of validNotes) {
    const end = note.cutTime || note.time + note.buffer.duration;
    totalDuration = Math.max(totalDuration, end);
  }
  log(`Total duration: ${totalDuration}`);

  const renderingCtx = new OfflineAudioContext(
    2,
    Math.ceil(totalDuration * 44100),
    44100,
  );
  for (const note of validNotes) {
    const source = renderingCtx.createBufferSource();
    source.buffer = note.buffer;
    source.loopStart = 0.1;
    source.connect(renderingCtx.destination);
    source.start(note.time);
    if (note.cutTime != undefined) {
      source.stop(note.cutTime);
    }
  }

  log(`Rendering audio...`);
  const buf = await renderingCtx.startRendering();

  log(`Getting ReplayGain...`);
  const replayGain = await getReplayGain(buf);
  log(`ReplayGain: ${replayGain}`);

  log("Converting to OGG file...");
  const ogg = await convertToOgg(buf, replayGain);

  return {
    ogg,
    replayGain,
  };
}

async function getReplayGain(buf: AudioBuffer) {
  const ffmpeg = await prepareFfmpeg(buf);
  try {
    let replayGain: number | undefined;

    const args = [
      ...["-f", "f32le", "-ar", "44100", "-i", "ch0.f32"],
      ...["-f", "f32le", "-ar", "44100", "-i", "ch1.f32"],
      ...[
        "-f",
        "null",
        "-filter_complex",
        "[0:a][1:a]join=inputs=2:channel_layout=stereo[a],[a]replaygain[b]",
        "-map",
        "[b]",
        "nothing",
      ],
    ];
    const handleLog = ({ message }: LogEvent) => {
      const m = message.match(/track_gain = (\S+) dB/);
      console.debug("=>", message);
      if (m) {
        replayGain = parseFloat(m[1]);
      }
    };
    ffmpeg.on("log", handleLog);
    try {
      await ffmpeg.exec(["-hide_banner", ...args]);
    } catch (e) {
      console.error(e);
    } finally {
      ffmpeg.off("log", handleLog);
    }

    if (!replayGain) {
      throw new Error("Failed to get ReplayGain");
    }
    return replayGain;
  } finally {
    ffmpeg.unmount("ch0.f32");
    ffmpeg.unmount("ch1.f32");
  }
}

async function convertToOgg(buf: AudioBuffer, replayGain: number) {
  const ffmpeg = await prepareFfmpeg(buf);
  try {
    const args = [
      ...["-f", "f32le", "-ar", "44100", "-i", "ch0.f32"],
      ...["-f", "f32le", "-ar", "44100", "-i", "ch1.f32"],
      ...[
        "-f",
        "ogg",
        "-acodec",
        "libvorbis",
        "-q:a",
        "6",
        "-filter_complex",
        `[0:a][1:a]join=inputs=2:channel_layout=stereo[a],[a]volume=volume=${
          replayGain + 4
        }dB[b]`,
        "-map",
        "[b]",
        "song.ogg",
      ],
    ];
    console.debug("=>", args);
    const handleLog = ({ message }: LogEvent) => {
      console.debug("=>", message);
    };
    ffmpeg.on("log", handleLog);
    try {
      await ffmpeg.exec(["-hide_banner", ...args]);
    } catch (e) {
      console.error(e);
    } finally {
      ffmpeg.off("log", handleLog);
    }

    const ogg = await ffmpeg.readFile("song.ogg");
    return ogg as Uint8Array<ArrayBuffer>;
  } finally {
    ffmpeg.unmount("ch0.f32");
    ffmpeg.unmount("ch1.f32");
    ffmpeg.unmount("song.ogg");
  }
}

export async function prepareFfmpeg(buf: AudioBuffer) {
  const ffmpeg = await createFFmpegInstance();
  for (let i = 0; i < 2; i++) {
    const channel = buf.getChannelData(i);
    ffmpeg.writeFile(
      `ch${i}.f32`,
      new Uint8Array(channel.buffer, channel.byteOffset, channel.byteLength),
    );
  }
  return ffmpeg;
}

async function getNotes(
  buffer: ArrayBuffer,
  name: string,
  io: {
    exists: (path: string) => boolean;
  },
) {
  const loader = new NotechartLoader();
  const notechart = await loader.load(buffer, { name }, { scratch: "left" });
  const notes = [...notechart.notes, ...notechart.autos];
  const info = notechart.songInfo;

  const keys: Record<string, { result: string | null }> = {};
  const times = _(notes)
    .filter((note) => !note.keysoundStart)
    .map((note) => ({
      time: note.time,
      src: lookup(note.keysound),
      keysound: note.keysound,
    }))
    .sortBy("time")
    .thru(cut)
    .value();

  return {
    path: name,
    info: info,
    data: times,
    keysounds: _(keys).values().map("result").compact().value(),
  };

  function lookup(k: string) {
    var result = keys[k] || (keys[k] = { result: find(k) });
    return result.result;
  }

  function find(k: string) {
    var wav = notechart.keysounds[k.toLowerCase()];
    if (!wav) return null;
    if (io.exists(wav)) return wav;
    wav = wav.replace(/\.\w\w\w$/, ".wav");
    if (io.exists(wav)) return wav;
    wav = wav.replace(/\.\w\w\w$/, ".ogg");
    if (io.exists(wav)) return wav;
    wav = wav.replace(/\.\w\w\w$/, ".mp3");
    if (io.exists(wav)) return wav;
    return null;
  }
}

function cut(
  sortedTimes: {
    keysound: string;
    time: number;
    src: string | null;
  }[],
): {
  keysound: string;
  time: number;
  cutTime?: number;
  src: string | null;
}[] {
  const last: Record<
    string,
    {
      keysound: string;
      time: number;
      cutTime?: number;
      src: string | null;
    }
  > = {};
  sortedTimes = _.cloneDeep(sortedTimes);

  sortedTimes.forEach(function (note) {
    try {
      if (last[note.keysound]) {
        last[note.keysound].cutTime = note.time;
      }
    } finally {
      last[note.keysound] = note;
    }
  });

  return _.reject(sortedTimes, function (note) {
    return (
      (
        note as {
          keysound: string;
          time: number;
          cutTime?: number;
          src?: string;
        }
      ).cutTime === note.time
    );
  });
}
