<script lang="ts">
  import { resolveFileFromPath } from "./resolveFile";

  interface Props {
    directoryHandle: FileSystemDirectoryHandle;
    songOgg: string;
    videoPath: string | undefined;
    videoOffset: number;
    setVideoOffset: (offset: number) => void;
  }
  const {
    directoryHandle,
    songOgg,
    videoPath,
    videoOffset,
    setVideoOffset,
  }: Props = $props();

  const videoUrlPromise = $derived(
    (async () => {
      if (!videoPath) return undefined;
      const fileHandle = await resolveFileFromPath(directoryHandle, videoPath);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    })(),
  );

  let instance: { canceled: boolean };
  let video: HTMLVideoElement | null = $state(null);
  let audio: HTMLAudioElement | null = $state(null);
  let resetCount = $state(0);
  let previewing = $state(false);
  function startPreview() {
    if (!video || !audio) {
      return;
    }
    const current: typeof instance = { canceled: false };
    instance = current;
    video.currentTime = 0;
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => {
      if (!current.canceled) video?.play();
    }, videoOffset * 1000);
    previewing = true;
  }
  function resetPreview() {
    if (instance) instance.canceled = true;
    resetCount++;
    previewing = false;
  }
  async function setOffset() {
    const offset = prompt("New offset", `${videoOffset}`);
    if (offset == null) {
      return;
    }
    const offsetNumber = parseFloat(offset);
    if (isNaN(offsetNumber)) {
      alert("Please enter a number");
      return;
    }
    if (offsetNumber < 0) {
      alert("Please enter a positive number");
      return;
    }
    setVideoOffset(offsetNumber);
  }
</script>

{#await videoUrlPromise}
  Loading vide
{:then url}
  {#if url}
    {#key resetCount}
      <video src={url} preload="auto" muted bind:this={video}></video>
      <audio src={songOgg} preload="auto" bind:this={audio}></audio>
      {#if previewing}
        <ui5-button design="Emphasized" onclick={resetPreview}>
          Stop
        </ui5-button>
      {:else}
        <ui5-button onclick={setOffset}>
          Set video offset ({videoOffset.toFixed(2)}s)
        </ui5-button>
        <ui5-button design="Emphasized" onclick={startPreview}>
          Test synchronization
        </ui5-button>
      {/if}
    {/key}
  {:else}
    Not specified
  {/if}
{:catch e}
  Unable to load {videoPath}: {e}
{/await}

<style>
  video {
    width: 100%;
  }
</style>
