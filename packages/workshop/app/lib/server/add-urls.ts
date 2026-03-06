import { save } from './save'
import type { ServerFile } from './server-file'

export async function addUrls(
  lines: string,
  serverFile: FileSystemFileHandle,
  data: ServerFile
) {
  const urls = (lines.match(/\S+/g) ?? []).flatMap((url) => {
    try {
      return [new URL(url.replace(/(\/|\/bemuse-song\.json|)$/, '/')).href]
    } catch (e) {
      return []
    }
  })
  const newUrls = [...data.urls]
  for (const url of urls) {
    if (!newUrls.some((item) => item.url === url)) {
      newUrls.push({ url, added: new Date().toISOString().slice(0, 10) })
    }
  }
  data = { ...data, urls: newUrls }
  await save(serverFile, data)
}
