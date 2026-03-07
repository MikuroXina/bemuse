import { useFileObjectUrl } from '~/lib/hooks/file-object-url'

import styles from './image-preview.module.css'

export interface ImagePreviewProps {
  directoryHandle: FileSystemDirectoryHandle
  path: string | undefined
}

export const ImagePreview = ({ directoryHandle, path }: ImagePreviewProps) => {
  const [imageUrl, error] = useFileObjectUrl(directoryHandle, path)

  return (
    <div className={styles.container}>
      {error ? (
        <>
          Unable to load {path}: {error}
        </>
      ) : imageUrl ? (
        <img src={imageUrl} className={styles.image} alt={path} />
      ) : (
        'Not found'
      )}
    </div>
  )
}
