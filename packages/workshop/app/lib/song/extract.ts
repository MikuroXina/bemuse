import { safeParse } from "valibot"
import { useEffect } from "react";
import type { Action } from "./reducer";
import { getSongFileHandleFromDirectory } from "../song-file";
import { songMetadataSchema, type SongMetadata } from "@mikuroxina/bemuse-types";
import type { SoundAssetsMetadata } from "../types";
import memoizeOne from "memoize-one";

  const getSongOgg = memoizeOne(
    (file: File) => URL.createObjectURL(file),
    (next: [File], prev: [File]) =>
      next[0]?.lastModified === prev[0]?.lastModified,
  );
  const getPreviewMp3 = memoizeOne(
    (file: File) => URL.createObjectURL(file),
    (next: [File], prev: [File]) =>
      next[0]?.lastModified === prev[0]?.lastModified,
  );

export const useExtract = (usingDir: FileSystemDirectoryHandle | null, dispatch: (action: Action) => void) => {
  useEffect(() => {
    const aborter = new AbortController();
    (async () => {
      if (!usingDir || aborter.signal.aborted) {
        return;
      }
      const bemuseDataDir = await usingDir.getDirectoryHandle("bemuse-data", {
        create: true,
      });
      let handle: FileSystemFileHandle;
      try {
        handle = await getSongFileHandleFromDirectory(usingDir, {
          create: false,
        });
      } catch {
        console.log("song file not found");
        // create and write a new song file
        handle = await getSongFileHandleFromDirectory(usingDir, {
          create: true,
        });
        const writable = await handle.createWritable();
        const newSong: SongMetadata = {
          title: "",
          artist: "",
          genre: "",
          bpm: 120,
          artist_url: "",
          replaygain: "-0.00 dB",
          charts: [],
          readme: "",
          preview_url: "_bemuse_preview.mp3",
          bemusepack_url: "assets/metadata.json",
        };
        await writable.write(JSON.stringify(newSong, null, 2));
        await writable.close();
      }

      let soundAssets: SoundAssetsMetadata | null
      try {
        const metadata = await bemuseDataDir
          .getDirectoryHandle("sound")
          .then((d) => d.getFileHandle("metadata.json"));
        const metadataFile = await metadata.getFile();
        const metadatatext = await metadataFile.text();
        const metadataJson = JSON.parse(metadatatext);
        soundAssets = metadataJson;
      } catch (error) {
        soundAssets = null;
      }

      const file = await handle.getFile();
      const text = await file.text();
      const songJson: unknown = JSON.parse(text);
      const songMetadataRes = safeParse(songMetadataSchema, songJson)
      const songMeta: SongMetadata | null = songMetadataRes.success ? songMetadataRes.output : null

      let readme = ""
      try {
        const readmeHandle = await usingDir.getFileHandle("README.md");
        const readmeFile = await readmeHandle.getFile()
        readme = await readmeFile.text();
        console.log(readme);
      } catch (error) {
        console.log("README.md not found", error);
      }

      let songOgg: string | null
      try {
        const songFileHandle = await bemuseDataDir.getFileHandle("song.ogg")
        const songFile = await songFileHandle.getFile();
        songOgg = getSongOgg(songFile);
      } catch (error) {
        songOgg = null;
      }

      let previewMp3: string | null
      try {
        const songFileHandle = await bemuseDataDir
          .getFileHandle("preview.mp3")
          const songFile= await songFileHandle.getFile();
        previewMp3 = getPreviewMp3(songFile);
      } catch (error) {
        previewMp3 = null;
      }

      if (aborter.signal.aborted) {
        return;
      }

      dispatch(["DONE_EXTRACT", {
        soundAssets,
songMeta,
readme,
songOgg,
previewMp3
      }])
    })();
    return () => {
      aborter.abort()
    }
  }, [usingDir]);
}
