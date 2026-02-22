import type Progress from '@bemuse/progress/index.js'
import download from '@bemuse/utils/download.js'

import type { IResource, IResources } from './types.js'

export class URLResource implements IResource {
  constructor(private url: string) {}
  read(progress: Progress) {
    return download(this.url).as('arraybuffer', progress)
  }

  async resolveUrl() {
    return Promise.resolve(this.url)
  }

  get name() {
    return new URL(this.url).pathname.split('/').pop()!
  }
}

export class URLResources implements IResources {
  constructor(public base: URL) {}
  async file(name: string): Promise<IResource> {
    const path = name
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')
    const href = new URL(path, this.base + '/').href
    return new URLResource(href)
  }
}

export default URLResource
