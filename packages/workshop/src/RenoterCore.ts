import { keyBy, memoize, times } from "lodash";
import type { RenoteData } from "./RenoterTypes";

type RenoteInput = Pick<RenoteData, "newNotes" | "replace" | "add">;

export async function renoteBms(
  bms: Uint8Array,
  data: RenoteInput,
): Promise<Uint8Array<ArrayBuffer>> {
  // Input
  const buffers = lines(bms);
  const output = [];
  const bmsLines: BMSLine[] = [];
  const bmsLinesByMeasure = memoize((measure: number) => [] as BMSLine[]);
  for (const line of buffers) {
    const decoded = new TextDecoder().decode(line);
    if (decoded[0] === "#" && decoded[6] === ":") {
      const bmsLine = new BMSLine(decoded);
      bmsLines.push(bmsLine);
      output.push(bmsLine);
      bmsLinesByMeasure(bmsLine.measure).push(bmsLine);
    } else {
      const match = decoded.match(/^#(\w+)\s/);
      if (match && ["LNTYPE", "LNOBJ"].includes(match[1].toUpperCase())) {
        // Skip
      } else if (match && data.replace?.[match[1]]) {
        output.push(
          new RawLine(
            new TextEncoder().encode(match[0] + data.replace[match[1]]),
          ),
        );
      } else {
        output.push(new RawLine(line));
      }
    }
  }
  let lnUsed = false;

  // Make existing channels autokeysounds
  for (const line of bmsLines) {
    if ("11" <= line.channel && line.channel <= "59") {
      line.channel = "01";
    }
  }

  // Scan for time signatures
  const timeSignatureByMeasure = memoize((measure: number) => ({ size: 960 }));
  for (const line of bmsLines) {
    if (line.channel === "02" && line.data instanceof BMSValue) {
      timeSignatureByMeasure(line.measure).size = Math.round(
        960 * +line.data.value,
      );
    }
  }

  // Move notes to new channels
  const newNotesWriter = new NewNotesWriter();
  let unmatchedNotes = 0;
  for (const [timeKey, overrides] of Object.entries(data.newNotes || {})) {
    const [measure, tick] = timeKey.split(":").map((x) => parseInt(x, 10));
    const measureSize = timeSignatureByMeasure(measure).size;
    for (const [channel, { value, length }] of Object.entries(overrides)) {
      const linesOnThisMeasure = bmsLinesByMeasure(measure);
      let found = false;
      for (const line of linesOnThisMeasure) {
        if (found) break;
        if (!line.isNoteData()) continue;
        if (!(line.data instanceof BMSObjectList)) continue;
        const objects = line.data.objects;
        for (const [i, sourceValue] of objects.entries()) {
          if (found) break;
          const sourceTick = Math.round((i * measureSize) / objects.length);
          if (sourceTick === tick && sourceValue === value) {
            const targetChannel = targetChannelOf[channel];
            if (length != null && length > 0) {
              lnUsed = true;
              const targetLnChannel = targetChannel.replace(/^1/, "5");
              newNotesWriter.addNote(
                measure,
                sourceTick,
                targetLnChannel,
                value,
              );
              let endMeasure = measure;
              let endTick = sourceTick + length;
              while (endTick >= timeSignatureByMeasure(endMeasure).size) {
                endTick -= Math.round(timeSignatureByMeasure(endMeasure).size);
                endMeasure++;
              }
              newNotesWriter.addNote(
                endMeasure,
                endTick,
                targetLnChannel,
                value,
              );
            } else {
              newNotesWriter.addNote(measure, sourceTick, targetChannel, value);
            }
            objects[i] = "00";
            found = true;
          }
        }
      }
      if (!found) unmatchedNotes += 1;
    }
  }
  console.log(unmatchedNotes + " notes not matched");
  if (lnUsed) {
    output.push(new RawLine(new TextEncoder().encode("#LNTYPE 1")));
  }
  for (const addedLine of newNotesWriter.getLines()) {
    const measureSize = timeSignatureByMeasure(addedLine.measure).size;
    output.push(addedLine.toBmsLine(measureSize));
  }

  // Add subartist
  for (const line of data.add || []) {
    output.push(new RawLine(new TextEncoder().encode(line)));
  }

  // Output
  const merger = new BufferMerger();
  const newLine = new Uint8Array([13, 10]);
  for (const line of output) {
    merger.add(line.toBuffer());
    merger.add(newLine);
  }
  return merger.merge();
}

const targetChannelOf: Record<string, string> = {
  SC: "16",
  K1: "11",
  K2: "12",
  K3: "13",
  K4: "14",
  K5: "15",
  K6: "18",
  K7: "19",
};

interface Line {
  toBuffer(): Uint8Array;
}

class NewNotesWriter {
  output: Record<string, NewBMSLine> = {};
  addNote(measure: number, tick: number, channel: string, value: string) {
    const command = `#${measure.toString().padStart(3, "0")}${channel}:`;
    this.output[command] ??= new NewBMSLine(command, measure);
    this.output[command].items.push({ tick, value });
  }
  getLines() {
    return Object.values(this.output).sort((a, b) =>
      a.command < b.command ? -1 : 1,
    );
  }
}
class NewBMSLine {
  items: { tick: number; value: string }[] = [];
  constructor(
    public command: string,
    public measure: number,
  ) {}
  toBmsLine(measureSize: number): BMSLine {
    const step = this.items.reduce((a, b) => gcd(a, b.tick), measureSize);
    const values = keyBy(this.items, (x) => x.tick);
    const out: string[] = [];
    let start = Date.now();
    for (let i = 0; i < measureSize; i += step) {
      out.push(values[i]?.value ?? "00");
      if (Date.now() - start > 1000) {
        console.error({ i, step, measureSize });
        throw new Error("wtf");
      }
    }
    return new BMSLine(this.command + out.join(""));
  }
}

function gcd(a: number, b: number) {
  if (b > a) {
    [a, b] = [b, a];
  }
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

class BMSLine implements Line {
  measure: number;
  channel: string;
  data: BMSObjectList | BMSValue;
  constructor(private line: string) {
    this.measure = parseInt(line.slice(1, 4), 10);
    this.channel = line.slice(4, 6).toUpperCase();
    if (this.isNoteData()) {
      this.data = new BMSObjectList(line.slice(7));
    } else {
      this.data = new BMSValue(line.slice(7));
    }
  }
  isNoteData() {
    return (
      this.channel === "01" || ("11" <= this.channel && this.channel <= "59")
    );
  }
  toBuffer(): Uint8Array {
    return new TextEncoder().encode(
      `#` +
        this.measure.toString().padStart(3, "0") +
        this.channel +
        ":" +
        this.data.toDataString(),
    );
  }
}

class BMSObjectList {
  objects: string[] = [];
  constructor(objects: string) {
    for (let i = 0; i + 1 < objects.length; i += 2) {
      this.objects.push(objects.slice(i, i + 2));
    }
  }
  toDataString() {
    return this.objects.join("");
  }
}

class BMSValue {
  constructor(public value: string) {}
  toDataString() {
    return this.value;
  }
}

class RawLine implements Line {
  constructor(private buffer: Uint8Array) {}
  toBuffer() {
    return this.buffer;
  }
}

class BufferMerger {
  parts: Uint8Array[] = [];
  length = 0;
  add(part: Uint8Array) {
    this.parts.push(part);
    this.length += part.length;
  }
  merge() {
    const buffer = new Uint8Array(this.length);
    let offset = 0;
    for (const part of this.parts) {
      buffer.set(part, offset);
      offset += part.length;
    }
    return buffer;
  }
}

/**
 * Split by newline.
 */
function lines(data: Uint8Array): Uint8Array[] {
  const lines: Uint8Array[] = [];
  for (;;) {
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 10) {
        let line = data.subarray(0, i);
        if (line[i - 1] === 13) {
          line = line.subarray(0, i - 1);
        }
        lines.push(line);
        data = data.subarray(i + 1);
        found = true;
        break;
      }
    }
    if (!found) {
      lines.push(data);
      break;
    }
  }
  return lines;
}
