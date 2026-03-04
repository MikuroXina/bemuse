<script lang="ts">
  import { Reader, type BMSChart } from "@mikuroxina/bms";
  import pMemoize from "p-memoize";

  import RenoteEditor from "./RenoteEditor.svelte";
  import { renoteBms } from "./RenoterCore";
  import { SoundPlayer } from "./RenoterSound";
  import type { RenoteData } from "./RenoterTypes";
  import { SongWorkshopLibs } from "./SongWorkshopLibs";
  import { Buffer } from "buffer";

  const { renoteSource }: { renoteSource: string } = $props();

  let state:
    | "checking"
    | { message: string }
    | {
        data: RenoteData;
        directoryHandle: FileSystemDirectoryHandle;
        renoteHandle: FileSystemFileHandle;
        fileHandle: FileSystemFileHandle;
        chart: BMSChart;
        chartData: ArrayBuffer;
      } = $state("checking");

  async function check() {
    state = "checking";
    let dir;
    try {
      dir = await window.showDirectoryPicker({ mode: "readwrite" });
    } catch (e) {
      state = { message: "No directory selected." };
      return;
    }
    try {
      const renoteHandle = await dir.getFileHandle(
        renoteSource + ".renote.json",
      );
      const renoteFile = await renoteHandle.getFile();
      const renoteData: RenoteData = JSON.parse(await renoteFile.text());
      const chartHandle = await dir.getFileHandle(renoteData.source);
      const chartFile = await chartHandle.getFile();
      const chartData = await chartFile.arrayBuffer();
      const chartText = await Reader.readAsync(Buffer.from(chartData));
      const { chart } = SongWorkshopLibs.bms.Compiler.compile(chartText);
      console.log(chart);
      state = {
        directoryHandle: dir,
        renoteHandle,
        fileHandle: chartHandle,
        data: renoteData,
        chart,
        chartData,
      };
    } catch (error) {
      state = { message: (error as Error).message };
    }
  }

  const getSample = pMemoize(async (soundFileSrc: string) => {
    if (!soundFileSrc) {
      return null;
    }
    if (typeof state !== "object" || !("directoryHandle" in state)) {
      throw new Error("Not loaded");
    }
    const soundFilesToTry = [
      soundFileSrc,
      soundFileSrc.replace(/\.\w\w\w$/, ".wav"),
      soundFileSrc.replace(/\.\w\w\w$/, ".ogg"),
      soundFileSrc.replace(/\.\w\w\w$/, ".mp3"),
    ];
    for (const file of soundFilesToTry) {
      try {
        const soundFileHandle = await state.directoryHandle.getFileHandle(file);
        const soundFile = await soundFileHandle.getFile();
        const soundData = await soundFile.arrayBuffer();
        const ctx = SoundPlayer.getInstance().context;
        const buffer = await ctx.decodeAudioData(soundData);
        return buffer;
      } catch (error) {
        console.log(error);
      }
    }
    throw new Error("No file");
  });

  async function onPreviewSound(soundFile?: string) {
    if (soundFile == null) {
      return;
    }
    getSample(soundFile).then((buf) => {
      if (buf) {
        SoundPlayer.getInstance().play(Promise.resolve(buf));
      }
    });
  }
  async function onSave(detail: Pick<RenoteData, "newNotes" | "groups">) {
    if (typeof state !== "object" || !("renoteHandle" in state)) {
      throw new Error("Not loaded");
    }
    const handle = state.renoteHandle;
    const newData: RenoteData = {
      ...state.data,
      newNotes: detail.newNotes,
      groups: detail.groups,
    };
    {
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(newData, null, 2));
      await writable.close();
    }
    const bmsHandle = await state.directoryHandle.getFileHandle(
      renoteSource + "_renote" + (newData.suffix || ".bms"),
      { create: true },
    );
    {
      const writable = await bmsHandle.createWritable();
      const buffer = await renoteBms(new Uint8Array(state.chartData), newData);
      await writable.write(buffer);
      await writable.close();
    }
    alert("Done");
  }
</script>

<main>
  <ui5-button design="Emphasized" onclick={check}
    >Choose a song folder</ui5-button
  >
  <ui5-shellbar id="shellbar" primary-title="Bemuse Renoter"></ui5-shellbar>
  {#if state === "checking"}
    <div style="padding: 1rem;">
      <ui5-messagestrip design="Information">Checking...</ui5-messagestrip>
    </div>
  {:else if "message" in state}
    <div style="padding: 1rem;">
      <ui5-messagestrip design="Negative">{state.message}</ui5-messagestrip>
    </div>
  {:else}
    <RenoteEditor
      data={state.data}
      chart={state.chart}
      previewSound={onPreviewSound}
      save={onSave}
    />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
