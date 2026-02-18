import { sceneRoot } from '@bemuse/utils/main-element'
import _ from 'lodash'
import React from 'react'

import { BemusePreviewer } from './BemusePreviewer'

export function main() {
  sceneRoot.render(<BemusePreviewer />)
}
