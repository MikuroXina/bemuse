import * as MusicPreviewer from '@bemuse/music-previewer'
import MAIN from '@bemuse/utils/main-element'
import React from 'react'
import { createRoot } from 'react-dom/client'

import CollectionViewer from './CollectionViewer'

export function main() {
  MusicPreviewer.preload()
  createRoot(MAIN).render(<CollectionViewer />)
}
