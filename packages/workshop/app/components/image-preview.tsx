import { useFileObjectUrl } from "~/lib/hooks/file-object-url";

export interface ImagePreviewProps {
  directoryHandle: FileSystemDirectoryHandle;
  path: string | undefined;
}

export const ImagePreview = ({ directoryHandle, path }: ImagePreviewProps) => {
  const [imageUrl, error] = useFileObjectUrl(directoryHandle, path);

  return (
    <div style={{ padding: "1rem" }}>
      {error ? (
        <>
          Unable to load {path}: {error}
        </>
      ) : imageUrl ? (
        <img src={imageUrl} style={{ maxWidth: "100%" }} alt={path} />
      ) : (
        "Loading"
      )}
    </div>
  );
};
