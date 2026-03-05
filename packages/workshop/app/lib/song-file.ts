import {
  songMetadataSchema,
  type SongMetadata,
} from "@mikuroxina/bemuse-types";
import { parse } from "valibot";

export async function getSongFileHandleFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  opts: FileSystemGetFileOptions,
) {
  return directoryHandle.getFileHandle("bemuse-song.json", opts);
}

export async function updateSongFile(
  directoryHandle: FileSystemDirectoryHandle,
  updater: (song: SongMetadata) => SongMetadata,
): Promise<void> {
  let data: SongMetadata;
  try {
    const handle = await getSongFileHandleFromDirectory(directoryHandle, {
      create: false,
    });
    const file = await handle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    data = parse(songMetadataSchema, parsed);
  } catch (e) {
    console.warn("Failed to read initial data", e);
    return;
  }

  const newData = updater(data);

  const fileHandle = await getSongFileHandleFromDirectory(directoryHandle, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(newData, null, 2));
  await writable.close();
}

export function validateSong(song: SongMetadata) {
  const problems: { keys: string[]; message: string }[] = [];
  const report = (message: string, ...keys: string[]) =>
    problems.push({ keys, message });

  if (!song.readme) {
    report(
      "Song description is missing. Consider adding song information from e.g. readme.txt or BMS event submission comments.",
      "readme",
    );
  }
  if (!song.replaygain) {
    report(
      "Loudness information is missing. Go to “Preview” tab and click on “Render song” to fix this issue.",
      "replaygain",
    );
  }
  if (!song.artist_url) {
    report("Artist URL is missing.", "artist_url");
  }
  if (!song.song_url && !song.youtube_url && !song.long_url) {
    report(
      "Song/YouTube/long URL is missing.",
      "song_url",
      "long_url",
      "youtube_url",
    );
  }
  if (!song.bms_url && !song.exclusive) {
    report("BMS download URL is missing.", "bms_url");
  }
  if (!song.bmssearch_id && !song.exclusive) {
    report("BMS search ID is missing.", "bmssearch_id");
  }
  if (!song.charts.filter((chart) => chart.keys === "5K").length) {
    report("5-key charts are missing.", "5key");
  }
  const playableCharts = song.charts.filter(
    (chart) => chart.keys === "7K" || chart.keys === "5K",
  );
  if (!playableCharts.length) {
    report(
      "The song does not have any playable charts. Playable charts must be either 5-keys or 7-keys (double-play not supported).",
      "charts",
    );
  }
  for (const chart of playableCharts) {
    if (!chart.info.subtitles.length && !song.chart_names?.[chart.file]) {
      report(
        "The chart file “" + chart.file + "” is missing a name",
        "chart_names " + chart.file,
      );
    }
  }
  return problems;
}

export function getMetadataStatus(song: SongMetadata | null) {
  if (!song) {
    return { ok: false, infoText: "Metadata file has not been created yet." };
  }
  if (
    song.readme ||
    song.artist_url ||
    song.song_url ||
    song.long_url ||
    song.bms_url ||
    song.bmssearch_id
  ) {
    return { ok: true, infoText: "Song metadata available." };
  }
  return { ok: false, infoText: "Please update song metadata." };
}
