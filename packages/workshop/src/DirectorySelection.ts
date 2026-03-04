import * as kv from "idb-keyval";
import { showFileSystemAccessRequestDialog } from "./FileSystemAccessRequestDialog";

export type SelectedDirectory = {
  directoryHandle: FileSystemDirectoryHandle;
  id: string;
};

export async function setSelectedDirectory(
  directoryHandle: FileSystemDirectoryHandle
) {
  return await kv.set("selectedDirectory", {
    directoryHandle: directoryHandle,
    id: "dir" + Date.now(),
  });
}

export async function unsetSelectedDirectory() {
  await kv.del("selectedDirectory");
}

function restoreDirectoryHandle(
  data: SelectedDirectory | undefined
): FileSystemDirectoryHandle | undefined {
  if (!data) {
    return undefined;
  }
  const anyWindow = window as any;
  if (
    anyWindow.savedSelectedDirectory &&
    anyWindow.savedSelectedDirectory.id === data.id
  ) {
    return anyWindow.savedSelectedDirectory.directoryHandle;
  }
  anyWindow.savedSelectedDirectory = data;
  return data.directoryHandle;
}

export async function getSelectedDirectory() {
  const data: SelectedDirectory | undefined = await kv.get("selectedDirectory");
  const dir = restoreDirectoryHandle(data);
  if (!dir) {
    return null;
  }
  let permission = await dir.queryPermission({ mode: "readwrite" });
  if (permission === "prompt") {
    try {
      permission = await dir.requestPermission({ mode: "readwrite" });
    } catch (error) {
      await showFileSystemAccessRequestDialog();
      permission = await dir.requestPermission({ mode: "readwrite" });
    }
  }
  if (permission !== "granted") {
    throw new Error("Folder access permission denied");
  }
  return dir;
}
