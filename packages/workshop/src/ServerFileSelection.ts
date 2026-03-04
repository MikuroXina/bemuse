import * as kv from "idb-keyval";
import { showFileSystemAccessRequestDialog } from "./FileSystemAccessRequestDialog";

export type SelectedServerFile = {
  fileHandle: FileSystemFileHandle;
  id: string;
};

export async function setSelectedServerFile(fileHandle: FileSystemFileHandle) {
  return await kv.set("selectedServerFile", {
    fileHandle: fileHandle,
    id: "f" + Date.now(),
  });
}

export async function unsetSelectedServerFile() {
  await kv.del("selectedServerFile");
}

function restoreServerFile(
  data: SelectedServerFile | undefined
): FileSystemFileHandle | undefined {
  if (!data) {
    return undefined;
  }
  const anyWindow = window as any;
  if (
    anyWindow.savedSelectedServerFile &&
    anyWindow.savedSelectedServerFile.id === data.id
  ) {
    return anyWindow.savedSelectedServerFile.fileHandle;
  }
  anyWindow.savedSelectedServerFile = data;
  return data.fileHandle;
}

export async function getSelectedServerFile() {
  const data: SelectedServerFile | undefined = await kv.get(
    "selectedServerFile"
  );
  const file = restoreServerFile(data);
  if (!file) {
    return null;
  }
  let permission = await file.queryPermission({ mode: "readwrite" });
  if (permission === "prompt") {
    try {
      permission = await file.requestPermission({ mode: "readwrite" });
    } catch (error) {
      await showFileSystemAccessRequestDialog();
      permission = await file.requestPermission({ mode: "readwrite" });
    }
  }
  if (permission !== "granted") {
    throw new Error("File access permission denied");
  }
  return file;
}
