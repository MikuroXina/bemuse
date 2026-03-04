import CryptoJS from "crypto-js";

export async function hashBlob(blob: Blob) {
  var wordArray = CryptoJS.lib.WordArray.create(
    (await blob.arrayBuffer()) as any
  );
  return CryptoJS.MD5(wordArray).toString();
}
