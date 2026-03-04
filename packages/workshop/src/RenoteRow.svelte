<script lang="ts">
  import type { BMSObject } from "@mikuroxina/bms";

  import { PX_PER_BEAT, type RenoterLayout } from "./RenoterLayout";

  import type { ObjectRow } from "./RenoterTypes";

  interface Props {
    row: ObjectRow;
    layout: RenoterLayout;
    selected: boolean;
    selectedColumnIndex: number;
    newNotes: Record<
      string,
      {
        value: string;
        length?: number;
      }
    >;
    setlength: (params: {
      row: ObjectRow;
      channel: string;
      length: number;
    }) => void;
    notemouseenter?: (object: BMSObject) => void;
    notemouseleave?: (object: BMSObject) => void;
  }

  const {
    row,
    layout,
    selected,
    selectedColumnIndex,
    newNotes,
    setlength,
    notemouseenter,
    notemouseleave,
  }: Props = $props();

  const notedObjects = $derived(
    Object.entries(newNotes || []).flatMap(([channel, info]) => {
      const matchingObject = row.objects.find((o) => o.value === info.value);
      if (!matchingObject) {
        return [];
      }
      return [
        {
          channel,
          object: matchingObject,
          length: info.length || 0,
        },
      ];
    }),
  );

  let dragging:
    | {
        startY: number;
        startLength: number;
        channel: string;
      }
    | undefined;

  function onMouseDown(
    e: MouseEvent,
    channel: string,
    object: BMSObject,
    startLength: number,
  ) {
    if (e.button !== 0) {
      return;
    }
    dragging = {
      startY: e.clientY,
      startLength,
      channel,
    };
    e.preventDefault();
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) {
      return;
    }
    const delta = e.clientY - dragging.startY;
    const newLength = Math.max(
      0,
      dragging.startLength - Math.round((delta / PX_PER_BEAT) * 4) * (240 / 4),
    );
    setlength({
      row,
      channel: dragging.channel,
      length: newLength,
    });
    e.preventDefault();
  }
  function onMouseUp(e: MouseEvent) {
    if (!dragging) {
      return;
    }
    dragging = undefined;
    e.preventDefault();
  }
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<div class="row" class:is-selected={selected}>
  <div class="line"></div>
  <div class="objectRow-text">
    {row.timeKey.split(":")[1]}
  </div>
  {#each notedObjects as { object, channel, length } (channel)}
    <div
      class="obj"
      data-channel={channel}
      style="transform: translateX({layout.getNoteX(
        channel,
      )}px);  --group-color: {layout.getGroupColor(
        layout.getGroupIndex(object),
      )}"
      onmousedown={(e) => onMouseDown(e, channel, object, length)}
      onmouseenter={() => notemouseenter?.(object)}
      onmouseleave={() => notemouseleave?.(object)}
    >
      {object.value}

      {#if length > 0}
        <div class="ln" style="--ln-length: {(length * PX_PER_BEAT) / 240}px">
          {object.value}
        </div>
      {/if}
    </div>
  {/each}
  {#each row.objects as object, i}
    <div
      class="obj"
      class:is-selectable={layout.getGroupIndex(object) === selectedColumnIndex}
      style="transform: translateX({layout.getX(
        row,
        object,
      )}px); --group-color: {layout.getGroupColor(
        layout.getGroupIndex(object),
      )}"
      onmouseenter={() => notemouseenter?.(object)}
      onmouseleave={() => notemouseleave?.(object)}
    >
      {object.value}
    </div>
  {/each}
</div>

<style>
  .obj {
    --note-background: #444;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-size: 12px;
    box-shadow:
      inset 1px 1px 0 #fff3,
      inset -1px -1px 0 #0006;
    background: var(--note-background);
    color: var(--group-color);
  }
  .obj[data-channel="K1"],
  .obj[data-channel="K3"],
  .obj[data-channel="K5"],
  .obj[data-channel="K7"] {
    --note-background: #666;
  }
  .obj[data-channel="K2"],
  .obj[data-channel="K6"] {
    --note-background: #448;
  }
  .obj[data-channel="SC"] {
    --note-background: #844;
  }
  .obj[data-channel="K4"] {
    --note-background: #484;
  }

  .ln {
    position: absolute;
    bottom: 15px;
    height: calc(var(--ln-length) + 1px);
    left: 1px;
    right: 1px;
    background: var(--note-background);
    box-shadow:
      inset 1px 1px 0 #fff3,
      inset -1px 0px 0 #0006;
  }

  .objectRow-text {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 64px;
    text-align: right;
    font-size: 12px;
    color: #555;
  }
  .line {
    position: absolute;
    height: 1px;
    left: 0;
    bottom: 0;
    right: 0;
    background: #0f0;
    opacity: 0;
  }
  .row.is-selected .line {
    opacity: 1;
  }
</style>
