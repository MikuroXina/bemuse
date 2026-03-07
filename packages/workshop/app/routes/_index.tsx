import '@ui5/webcomponents-icons/factory.js'
import '@ui5/webcomponents-icons/shelf.js'
import '@ui5/webcomponents-icons/edit.js'

import { ProductSwitch } from '@ui5/webcomponents-react/ProductSwitch'
import { ProductSwitchItem } from '@ui5/webcomponents-react/ProductSwitchItem'

export default function Index() {
  return (
    <ProductSwitch>
      <ProductSwitchItem
        titleText='Custom Song'
        subtitleText='Prepare song data'
        icon='factory'
        targetSrc='./song/'
      />
      <ProductSwitchItem
        titleText='Server Manager'
        subtitleText='Prepare server file'
        icon='shelf'
        targetSrc='./server/'
      />
      <ProductSwitchItem
        titleText='Renoter'
        subtitleText='Edit notes'
        icon='edit'
        targetSrc='./renoter/'
      />
    </ProductSwitch>
  )
}
