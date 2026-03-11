import CustomBMS from '@bemuse/components/custom-bms.js'
import { sceneRoot } from '@bemuse/utils/main-element.js'

const DropBMSScene = () => (
  <div>
    <CustomBMS />
  </div>
)

export function main() {
  sceneRoot.render(<DropBMSScene />)
}
