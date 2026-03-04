import { BemusePackage } from "./BemusePackage";
import { describe, expect, it } from "vitest";

describe("bemuse-package", () => {
  it("has size 10 for blank package", () => {
    const p = new BemusePackage();
    const blob = p.toBlob();
    expect(blob.size).to.equal(14);
  });
  it("returns range when adding data", async () => {
    const p = new BemusePackage();
    expect(p.addBlob(new Blob(["wtf"]))).to.deep.equal([0, 3]);
    expect(p.addBlob(new Blob(["meow"]))).to.deep.equal([3, 7]);
    const blob = p.toBlob();
    expect(await blob.text()).to.equal("BEMUSEPACK\0\0\0\0wtfmeow");
  });
});

export {};
