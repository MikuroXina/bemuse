import type { IndexingInputFile } from "@mikuroxina/bemuse-indexer/lib/types";
import { updateSongFile } from "./SongFile";
import { SongWorkshopLibs } from "./SongWorkshopLibs";
import { getSongInfo } from "@mikuroxina/bemuse-indexer/lib";

export type IndexIO = {
  setStatus: (status: string) => void;
};

export async function indexChartFilesFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  io: IndexIO,
) {
  const inputs: IndexingInputFile[] = [];
  for await (let [name, handle] of directoryHandle) {
    try {
      if (handle.kind === "file" && /\.(bms|bme|bml|bmson)$/i.test(name)) {
        io.setStatus(`Reading ${name}...`);
        const fileHandle = handle;
        const file = await (fileHandle as FileSystemFileHandle).getFile();
        const fileContents = await file.arrayBuffer();
        const buffer = SongWorkshopLibs.buffer.Buffer.from(fileContents);
        inputs.push({
          name,
          data: buffer,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  io.setStatus("Indexing charts...");
  const result = await getSongInfo(inputs, {
    onProgress: (processed, total, name) => {
      io.setStatus(`Indexed (${processed}/${total}) ${name}...`);
    },
  });
  await updateSongFile(directoryHandle, (song) => {
    return {
      ...song,
      bemusepack_url: "bemuse-data/sound/metadata.json",
      charts: result.charts,
      title: song.title || result.title,
      artist: song.artist || result.artist,
      genre: song.genre || result.genre,
      bpm: song.bpm || result.bpm,
    };
  });
}

// SongWorkshopLibs.indexer.getSongInfo(files, { onProgress })
