/**
 * The resources class contains a mapping from an image "src" to the resolved
 * image "url."
 */
export class Resources {
  _map: Record<string, string> = {}

  add(src: string, url: string): void {
    this._map[src] = url
  }

  get(src: string): string {
    if (!(src in this._map)) throw new Error('Not registered: ' + src)
    return this._map[src]
  }

  get urls(): string[] {
    return Object.values(this._map)
  }
}

export default Resources
