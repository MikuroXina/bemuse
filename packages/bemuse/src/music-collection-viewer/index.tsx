import MAIN from '@bemuse/utils/main-element'
import { createRoot } from 'react-dom/client'

import CollectionViewer from './collection-viewer'

export function main() {
  if (MAIN) {
    createRoot(MAIN).render(<CollectionViewer />)
  }
}
