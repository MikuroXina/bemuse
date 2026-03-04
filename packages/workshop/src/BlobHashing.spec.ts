import { hashBlob } from "./BlobHashing";
import { describe, expect, it } from "vitest";

describe("hashBlob", () => {
  it("should hash a blob", async () => {
    const hash = await hashBlob(new Blob(["meow"]));
    expect(hash).to.equal("4a4be40c96ac6314e91d93f38043a634");
  });
});
