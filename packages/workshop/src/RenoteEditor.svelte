<script lang="ts">
  import { Keysounds, type BMSChart, type BMSObject } from "@mikuroxina/bms";
  import { memoize, sortedIndexBy } from "lodash";
  import { onMount, onDestroy } from "svelte";
  import { calculateLayout, PX_PER_BEAT } from "./RenoterLayout";
  import RenoteRow from "./RenoteRow.svelte";
  import type { ObjectRow, RenoteData } from "./RenoterTypes";

  interface Props {
    previewSound: (sound?: string) => void;
    save: (params: Pick<RenoteData, "newNotes" | "groups">) => void;
    chart: BMSChart;
    data: RenoteData;
  }

  const { previewSound, save, chart, data }: Props = $props();

  const VIEWPORT_PADDING_PX = 192;
  const BOTTOM_PX = 32;

  let newNotes = $derived(data.newNotes || {});
  let groups = $derived(data.groups || []);
  let scroller: HTMLDivElement;

  const toBeat = memoize(
    (measure: number, fraction: number) => {
      return chart.timeSignatures.measureToBeat(measure, fraction);
    },
    (measure: number, fraction: number) => `${measure}-${fraction}`,
  );

  const maxMeasure = $derived(
    chart.objects.all().reduce((a, o) => Math.max(a, o.measure), 0) + 1,
  );
  const maxTime = $derived(
    chart.objects
      .all()
      .reduce((a, o) => Math.max(a, toBeat(o.measure, o.fraction)), 0),
  );
  const canvasHeight = $derived(maxTime * PX_PER_BEAT + VIEWPORT_PADDING_PX);
  const keysounds = $derived(Keysounds.fromBMSChart(chart));
  $inspect(keysounds);

  let viewport: [number, number] = $state([0, 0]);
  function onScroll() {
    viewport = [scroller.scrollTop, scroller.scrollTop + scroller.clientHeight];
  }
  onMount(() => {
    scroller.scrollTop = canvasHeight;
    onScroll();
    window.addEventListener("resize", onScroll);
  });
  onDestroy(() => {
    window.removeEventListener("resize", onScroll);
  });

  function getY(beat: number) {
    return canvasHeight - BOTTOM_PX - beat * PX_PER_BEAT;
  }
  function groupObjectsByY(objects: BMSObject[]) {
    let rows: ObjectRow[] = [];
    const map: Record<number, ObjectRow> = {};
    for (let o of objects) {
      if (o.channel !== "01" && !("11" <= o.channel && o.channel <= "59")) {
        continue;
      }
      let y = getY(toBeat(o.measure, o.fraction));
      const beatsThisMeasure = chart.timeSignatures.getBeats(o.measure);
      let row = map[y];
      if (!row) {
        row = {
          y,
          objects: [],
          timeKey: [
            o.measure,
            Math.round(o.fraction * 960 * (beatsThisMeasure / 4)),
          ].join(":"),
        };
        rows.push(row);
        map[y] = row;
      }
      row.objects.push(o);
    }
    rows.sort((a, b) => a.y - b.y);
    for (const row of rows) {
      row.objects.sort((a, b) => (a.value < b.value ? -1 : 1));
    }
    return rows;
  }
  function filterVisible<T extends { y: number }>(
    range: typeof viewport,
    things: T[],
  ): T[] {
    return things.filter((t) => t.y >= range[0] && t.y <= range[1]);
  }
  const measureLines = $derived(
    new Array(maxMeasure)
      .fill(0)
      .map((_, i) => ({ number: i, y: getY(toBeat(i, 0)) })),
  );
  const objectRows = $derived(groupObjectsByY(chart.objects.allSorted()));
  const layout = $derived(calculateLayout(objectRows, groups, keysounds));
  const visibleObjectRows = $derived(filterVisible(viewport, objectRows));

  let info = $state("Hover to see sound file");
  let selectedTimeKey = $state("");
  let selectedGroupIndex = $state(0);

  function onNoteHover(e: BMSObject) {
    const keysound = keysounds.get(e.value);
    info = `${e.value}: ${keysound}`;
    previewSound(keysound);
  }

  function onMouseMove(e: MouseEvent) {
    const rect = scroller.getBoundingClientRect();
    if (true || e.shiftKey) {
      const x = e.clientX - rect.left + scroller.scrollLeft;
      const y = e.clientY - rect.top + scroller.scrollTop;
      const rowIndex = sortedIndexBy<{ y: number }>(
        objectRows,
        { y: y },
        (r) => r.y,
      );
      if (objectRows[rowIndex]) {
        selectedTimeKey = objectRows[rowIndex].timeKey;
      }
      const groupIndex =
        sortedIndexBy<{ x: number }>(
          layout.groupColumns,
          { x: x },
          (c) => c.x,
        ) - 1;
      if (layout.groupColumns[groupIndex]) {
        selectedGroupIndex = groupIndex;
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      console.log("Save!!!");
      save({
        newNotes,
        groups,
      });
      return;
    }
    switch (e.key) {
      case "ArrowLeft": {
        e.preventDefault();
        selectedGroupIndex = layout.getPreviousGroupIndex(selectedGroupIndex);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        selectedGroupIndex = layout.getNextGroupIndex(selectedGroupIndex);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        goToRow(layout.getRowAbove(selectedTimeKey, selectedGroupIndex));
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        goToRow(layout.getRowBelow(selectedTimeKey, selectedGroupIndex));
        break;
      }
      case "a": {
        e.preventDefault();
        toggleChannel("SC");
        break;
      }
      case "z": {
        e.preventDefault();
        toggleChannel("K1");
        break;
      }
      case "s": {
        e.preventDefault();
        toggleChannel("K2");
        break;
      }
      case "x": {
        e.preventDefault();
        toggleChannel("K3");
        break;
      }
      case "d": {
        e.preventDefault();
        toggleChannel("K4");
        break;
      }
      case "c": {
        e.preventDefault();
        toggleChannel("K5");
        break;
      }
      case "f": {
        e.preventDefault();
        toggleChannel("K6");
        break;
      }
      case "v": {
        e.preventDefault();
        toggleChannel("K7");
        break;
      }
      default: {
        console.warn("Unhandled key", e.key);
      }
    }
  }
  function toggleChannel(channel: string) {
    const row = layout.getRowByTimeKey(selectedTimeKey);
    if (!row) {
      return;
    }

    const newNotesOnThisRow = newNotes[row.timeKey] || {};
    const current = newNotesOnThisRow[channel];
    const valuesUsedInOtherChannels = new Set(
      Object.entries(newNotesOnThisRow)
        .filter(([k]) => k !== channel)
        .map(([k, v]) => v.value),
    );
    const usableObjects = row.objects
      .filter((o) => layout.getGroupIndex(o) === selectedGroupIndex)
      .filter((o) => !valuesUsedInOtherChannels.has(o.value));
    const nextNewNotesOnThisRow = { ...newNotesOnThisRow };
    if (!current && usableObjects.length) {
      nextNewNotesOnThisRow[channel] = { value: usableObjects[0].value };
    } else if (current) {
      const index = usableObjects.findIndex((o) => o.value === current.value);
      const nextItem = usableObjects[index + 1];
      if (nextItem) {
        nextNewNotesOnThisRow[channel] = { value: nextItem.value };
      } else {
        delete nextNewNotesOnThisRow[channel];
      }
    }
    if (nextNewNotesOnThisRow[channel]) {
      const keysound = keysounds.get(nextNewNotesOnThisRow[channel].value);
      previewSound(keysound);
    }
    newNotes[row.timeKey] = nextNewNotesOnThisRow;
  }
  function goToRow(row: ObjectRow | undefined) {
    if (!row) {
      return;
    }
    const previousY = layout.getRowByTimeKey(selectedTimeKey)?.y;
    const nextY = row.y;
    if (previousY != null) {
      scroller.scrollTop += nextY - previousY;
    }
    if (
      !(
        scroller.scrollTop <= nextY &&
        nextY <= scroller.scrollTop + scroller.clientHeight
      )
    ) {
      scroller.scrollTop = nextY - scroller.clientHeight * 0.75;
    }
    selectedTimeKey = row.timeKey;
  }
  function onSetLength(e: { row: ObjectRow; channel: string; length: number }) {
    const { row, channel, length } = e;
    if (newNotes[row.timeKey] && newNotes[row.timeKey][channel]) {
      newNotes[row.timeKey] = {
        ...newNotes[row.timeKey],
        [channel]: { ...newNotes[row.timeKey][channel], length },
      };
    }
  }

  function calculateNewNotes(n: typeof newNotes) {
    return Object.values(n).reduce((a, x) => a + Object.keys(x).length, 0);
  }
  const totalNotes = $derived(calculateNewNotes(newNotes));
</script>

<div
  style="padding: 1rem; display: flex; gap: 1rem; height: calc(100vh - 80px)"
>
  <div style="flex: 1; position: relative; background: #000; color: #0f0">
    <div
      style="position: absolute; inset: 0; overflow: auto;"
      bind:this={scroller}
      onscroll={onScroll}
      onmousemove={onMouseMove}
      onkeydown={onKeyDown}
      tabindex="0"
    >
      <div style="height: {canvasHeight}px; position: relative;">
        {#each layout.groupColumns as { x, width }, index}
          <div
            class="col"
            class:is-selected={selectedGroupIndex === index}
            style="left: {x}px; width: {width}px;"
          ></div>
        {/each}
        {#each measureLines as measure (measure.number)}
          <div class="measure" style="top: {measure.y}px">
            <div class="measure-text">
              #{measure.number.toString().padStart(3, "0")}
            </div>
          </div>
        {/each}
        {#each visibleObjectRows as row (row.y)}
          <div class="objectRow" style="top: {row.y}px">
            <RenoteRow
              selected={row.timeKey === selectedTimeKey}
              {row}
              {layout}
              selectedColumnIndex={selectedGroupIndex}
              newNotes={newNotes[row.timeKey]}
              notemouseenter={onNoteHover}
              setlength={onSetLength}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div
    style="flex: none; width: 256px; position: relative;"
    class="ui5-content-density-compact"
  >
    <div style="position: absolute; inset: 0; overflow: auto;">
      <ui5-messagestrip design="Information" hide-close-button
        >notes: {totalNotes}</ui5-messagestrip
      >
      <ui5-messagestrip design="Information" hide-close-button
        >{info}</ui5-messagestrip
      >
      <ui5-tree mode="SingleSelect">
        {#each groups as group, i}
          <ui5-tree-item expanded text="Group {i + 1}">
            {#each group.patterns as pattern}
              <ui5-tree-item text={pattern}></ui5-tree-item>
            {/each}
          </ui5-tree-item>
        {/each}
      </ui5-tree>
      {viewport}
    </div>
  </div>
</div>

<style>
  .measure {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    margin-top: -1px;
    background: #333;
  }
  .measure-text {
    position: absolute;
    bottom: 0;
    left: 0;
    color: #666;
  }
  .objectRow {
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
  }
  .col {
    position: absolute;
    top: 0;
    bottom: 0;
    background: #111;
  }
  .col.is-selected {
    background: #222;
  }
</style>
