export async function resolveFile(
  base: FileSystemDirectoryHandle,
  components: string[],
): Promise<FileSystemFileHandle> {
  if (components.length === 0) {
    throw new Error("No file name specified");
  }
  if (components.length === 1) {
    return base.getFileHandle(components[0]);
  }
  const dir = await base.getDirectoryHandle(components[0]);
  return await resolveFile(dir, components.slice(1));
}

export function resolveFileFromPath(
  base: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle> {
  return resolveFile(base, path.split("/"));
}
