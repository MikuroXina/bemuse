import { FFmpeg, type LogEvent } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import pMemoize from "p-memoize";

export const createFFmpegInstance = async (): Promise<FFmpeg> => {
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }: LogEvent) => {
    console.log(message);
  });

  const baseUrl = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/";
  const coreUrl = await toBlobURL(
    `${baseUrl}ffmpeg-core.js`,
    "text/javascript",
  );
  const wasmUrl = await toBlobURL(
    `${baseUrl}ffmpeg-core.wasm`,
    "application/wasm",
  );
  console.dir({ coreUrl, wasmUrl });
  await ffmpeg.load({
    coreURL: coreUrl,
    wasmURL: wasmUrl,
  });

  return ffmpeg;
};

export const getFFmpegInstance = pMemoize(createFFmpegInstance);
Object.assign(window, {
  createFfmpegInstance: createFFmpegInstance,
  getFfmpegInstance: getFFmpegInstance,
});
