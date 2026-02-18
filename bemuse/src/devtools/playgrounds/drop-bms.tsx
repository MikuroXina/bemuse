import CustomBMS from '@bemuse/app/ui/CustomBMS'
import { sceneRoot } from '@bemuse/utils/main-element'
import React from 'react'

const DropBMSScene = () => (
  <div>
    <CustomBMS />
  </div>
)

export function main() {
  sceneRoot.render(<DropBMSScene />)
}
