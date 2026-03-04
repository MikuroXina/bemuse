import { fetchFile } from "@ffmpeg/util";
import { BemusePackage } from "./BemusePackage";
import { hashBlob } from "./BlobHashing";
import { createFFmpegInstance } from "./ffmpegCore";
import type { SoundAssetsMetadata } from "./types";

type ConvertIO = {
  setStatus: (status: string) => void;
  writeWarning: (text: string) => void;
};

export async function convertAudioFilesInDirectory(
  dir: FileSystemDirectoryHandle,
  io: ConvertIO,
) {
  let i = 1;
  io.setStatus("Loading ffmpeg core (~16 MB, please wait)…");
  let ffmpeg = await createFFmpegInstance();
  io.setStatus("Getting ready to convert files.");
  const soundAssets: SoundAsset[] = [];
  for await (const [name, handle] of dir) {
    if (handle.kind === "file" && /\.(?:mp3|wav|ogg)$/i.test(name)) {
      const num = i++;
      if (num % 30 === 29) {
        // hack to deal with memory leaking of ffmpeg.wasm
        ffmpeg.terminate();
        ffmpeg = await createFFmpegInstance();
      }
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        if (file.size === 0) {
          io.writeWarning(`Skipping empty file ${name}`);
          continue;
        }
        const inBuffer = await fetchFile(file);
        const inFileName = "in_" + num + "." + name.substring(-3);
        const outFileName = "out_" + num + ".ogg";
        ffmpeg.writeFile(inFileName, inBuffer);
        try {
          let exitCode = -1;
          try {
            const args = [
              "-i",
              inFileName,
              "-ac",
              "2",
              "-ar",
              "44100",
              "-acodec",
              "libvorbis",
              "-threads",
              "1",
              outFileName,
            ];
            exitCode = await ffmpeg.exec(["-hide_banner", ...args]);
          } catch (e) {
            console.log(e);
          }
          if (exitCode !== 0) {
            console.error("conversion failed");
            continue;
          }
          const outBuffer = await ffmpeg.readFile(outFileName);
          ffmpeg.deleteFile(outFileName);
          console.log(name, inBuffer.length, "=>", outBuffer.length);
          soundAssets.push({
            name: name.substring(0, name.length - 4) + ".ogg",
            size: outBuffer.length,
            buffer: outBuffer as Uint8Array<ArrayBuffer>,
          });
          io.setStatus(`Converted sound asset #${num}: ${name}`);
        } finally {
          ffmpeg.deleteFile(inFileName);
        }
      } catch (error) {
        io.writeWarning(`Error converting ${name}: ${error}`);
        console.error(error);
      }
      await new Promise((resolve) => requestIdleCallback(resolve));
    }
  }
  soundAssets.sort((a, b) => {
    if (a.size !== b.size) {
      return b.size - a.size;
    }
    return a.name.localeCompare(b.name);
  });
  const packer = new SoundAssetPacker();
  for (const asset of soundAssets) {
    packer.add(asset);
  }
  io.setStatus("Writing asset files.");
  await packer.writeToDirectory(dir, io);
  io.setStatus(
    `Converted. Assets: ${soundAssets.length}, Packs: ${packer.getNumPacks()}`,
  );
}

class SoundAssetPacker {
  private max = 1474560;
  private cur: BemusePackage | null = null;
  private packs: BemusePackage[] = [];
  private files: {
    name: string;
    ref: readonly [number, number, number];
  }[] = [];
  add(asset: SoundAsset) {
    if (
      this.cur === null ||
      (this.cur.size > 0 && this.cur.size + asset.size > this.max)
    ) {
      this.cur = new BemusePackage();
      this.packs.push(this.cur);
    }
    const range = this.cur.addBlob(new Blob([asset.buffer]));
    const ref = [this.packs.length - 1, ...range] as const;
    this.files.push({ name: asset.name, ref });
  }
  getNumPacks() {
    return this.packs.length;
  }
  async writeToDirectory(
    directoryHandle: FileSystemDirectoryHandle,
    io: ConvertIO,
  ) {
    const dir = await directoryHandle
      .getDirectoryHandle("bemuse-data", { create: true })
      .then((h) => h.getDirectoryHandle("sound", { create: true }));
    const refs: SoundAssetsMetadata["refs"] = [];
    for (const [i, pack] of this.packs.entries()) {
      const blob = pack.toBlob();
      const hash = await hashBlob(blob);
      const fileName = "oggs." + i + "." + hash.substring(0, 8) + ".bemuse";
      const file = await dir.getFileHandle(fileName, { create: true });
      const writable = await file.createWritable();
      await writable.write(blob);
      await writable.close();
      refs.push({ path: fileName, hash, size: blob.size });
      io.setStatus(`Wrote pack #${i + 1}: ${fileName}`);
    }

    // Write metadata file
    {
      const metadata = JSON.stringify({
        files: this.files,
        refs,
      });
      const file = await dir.getFileHandle("metadata.json", { create: true });
      const writable = await file.createWritable();
      await writable.write(new TextEncoder().encode(metadata));
      await writable.close();
    }
  }
}

type SoundAsset = {
  name: string;
  size: number;
  buffer: Uint8Array<ArrayBuffer>;
};
