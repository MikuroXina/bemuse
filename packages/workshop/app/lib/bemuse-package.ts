export class BemusePackage {
  private parts: Blob[] = [];
  public size = 0;
  toBlob(): Blob {
    return new Blob(["BEMUSEPACK", new Uint8Array(4), ...this.parts]);
  }
  addBlob(blob: Blob): [number, number] {
    const range = [this.size, this.size + blob.size] as [number, number];
    this.parts.push(blob);
    this.size += blob.size;
    return range;
  }
}
