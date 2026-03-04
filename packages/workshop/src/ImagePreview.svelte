<script lang="ts">
  import { resolveFileFromPath } from "./resolveFile";

  interface Props {
    directoryHandle: FileSystemDirectoryHandle;
    path: string | undefined;
  }

  const { directoryHandle, path }: Props = $props();

  const imageUrlPromise = $derived(
    (async () => {
      if (!path) return undefined;
      const fileHandle = await resolveFileFromPath(directoryHandle, path);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    })(),
  );
</script>

<div style="padding: 1rem">
  {#await imageUrlPromise}
    Loading
  {:then url}
    {#if url}
      <img src={url} style="max-width: 100%" alt={path} />
    {:else}
      Not specified
    {/if}
  {:catch e}
    Unable to load {path}: {e}
  {/await}
</div>
