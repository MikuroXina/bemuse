export function resolveFile(
  base: FileSystemDirectoryHandle,
  components: string[]
) {
  if (components.length === 0) {
    throw new Error("No file name specified");
  }
  if (components.length === 1) {
    return base.getFileHandle(components[0]);
  }
  return base
    .getDirectoryHandle(components[0])
    .then((dir) => resolveFile(dir, components.slice(1)));
}

export function resolveFileFromPath(
  base: FileSystemDirectoryHandle,
  path: string
) {
  return resolveFile(base, path.split("/"));
}
