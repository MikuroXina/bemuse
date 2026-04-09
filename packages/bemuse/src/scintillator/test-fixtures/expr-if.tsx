import { Atom } from '@bemuse/skin/index.js'

import testImage from './test.png?url'

export default function ExprIf() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.If keyName='a' value='b'>
        <Atom.Sprite image={testImage} x='10' y='20' />
      </Atom.If>
    </Atom.Skin>
  )
}
