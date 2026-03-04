import { renoteBms } from "./RenoterCore";
import { describe, expect, it } from "vitest";
import type { RenoteData } from "./RenoterTypes";
import { SongWorkshopLibs } from "./SongWorkshopLibs";

describe("renoteBms", () => {
  it("remaps notes", async () => {
    await check(
      ["#00101:AABB", "#00101:BBAA", "#00211:FF", "#00212:EE"],
      {
        newNotes: {
          "1:480": {
            K1: { value: "BB" },
          },
          "2:0": {
            SC: { value: "FF" },
          },
        },
      },
      [
        "#00101:AA00",
        "#00101:BBAA",
        "#00201:00",
        "#00201:EE",
        "#00111:00BB",
        "#00216:FF",
      ],
    );
  });
  it("supports time signature", async () => {
    await check(
      ["#00102:0.5", "#00101:0102"],
      {
        newNotes: {
          "1:240": {
            K1: { value: "02" },
          },
        },
      },
      ["#00102:0.5", "#00101:0100", "#00111:0002"],
    );
  });
  it("supports long notes", async () => {
    await check(
      ["#00115:01"],
      {
        newNotes: {
          "1:0": {
            K1: { value: "01", length: 240 },
          },
        },
      },
      ["#00101:00", "#LNTYPE 1", "#00151:01010000"],
    );
  });
  it("supports long overflow to next measure", async () => {
    await check(
      ["#00102:0.125", "#00115:01"],
      {
        newNotes: {
          "1:0": {
            K1: { value: "01", length: 240 },
          },
        },
      },
      [
        "#00102:0.125",
        "#00101:00",
        "#LNTYPE 1",
        "#00151:01",
        "#00251:0001000000000000",
      ],
    );
  });
});

async function check(
  bms: string[],
  data: Pick<RenoteData, "newNotes">,
  expected: string[],
) {
  const bmsBuffer = new TextEncoder().encode(
    bms.map((b) => b + "\r\n").join(""),
  );
  const out = await renoteBms(bmsBuffer, data);
  const normalize = (s: string) => {
    return s
      .split(/\n/)
      .map((x) => x.trim())
      .filter((x) => x)
      .join("\n");
  };
  expect(normalize(new TextDecoder().decode(out))).to.deep.equal(
    normalize(expected.map((b) => b + "\r\n").join("")),
  );
}

export {};
