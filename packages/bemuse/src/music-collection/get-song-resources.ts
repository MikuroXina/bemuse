import type { Song } from '@bemuse/collection-model/types.js'
import BemusePackageResources from '@bemuse/resources/bemuse-package.js'
import { resolveRelativeResources } from '@bemuse/resources/resolveRelativeResource.js'
import type { IResources } from '@bemuse/resources/types.js'
import { URLResources } from '@bemuse/resources/url.js'

export function getSongResources(
  song: Song,
  serverUrl: string
): {
  /** The base resources for loading chart files, song previews. */
  baseResources: IResources

  /** The resources for loading sound file assets. */
  assetResources: IResources
} {
  const baseResources =
    song.resources ||
    new URLResources(
      new URL(song.path.replace(/\/?$/, '/'), serverUrl.replace(/\/?$/, '/'))
    )
  const assetResources = wrapAssetResources(baseResources, song.bemusepack_url)
  return { baseResources, assetResources }
}

function wrapAssetResources(
  base: IResources,
  bemusepackUrl: string | null | undefined
): IResources {
  if (bemusepackUrl === null) {
    return base
  }
  if (bemusepackUrl === undefined) {
    bemusepackUrl = 'assets/metadata.json'
  }
  const [assetsBase, metadataFilename] = resolveRelativeResources(
    base,
    bemusepackUrl
  )
  return new BemusePackageResources(assetsBase, {
    metadataFilename: metadataFilename,
    fallback: base,
    fallbackPattern: /\.(?:png|jpg|webm|mp4|m4v)/,
  })
}
