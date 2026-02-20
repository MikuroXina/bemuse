import CustomBMS from '@bemuse/app/ui/CustomBMS.js'
import { sceneRoot } from '@bemuse/utils/main-element.js'

const DropBMSScene = () => (
  <div>
    <CustomBMS />
  </div>
)

export function main() {
  sceneRoot.render(<DropBMSScene />)
}
