import { useEffect, useState } from 'react'
import { resolveFileFromPath } from '../resolve-file'

export const useFileObjectUrl = (
  directoryHandle: FileSystemDirectoryHandle,
  path?: string
): [objectUrl: string | null, error: Error | null] => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    if (!path) {
      return
    }
    const aborter = new AbortController()
    async function fetchImage(path: string) {
      const fileHandle = await resolveFileFromPath(directoryHandle, path)
      const file = await fileHandle.getFile()
      const newUrl = URL.createObjectURL(file)
      if (aborter.signal.aborted) {
        return
      }
      setImageUrl(newUrl)
    }
    fetchImage(path).catch((e) => {
      setError(e)
    })
    return () => {
      aborter.abort()
    }
  }, [directoryHandle, path])
  return [imageUrl, error]
}
