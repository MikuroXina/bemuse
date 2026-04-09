import { Atom } from '@bemuse/skin/index.js'

import testImage from './test.png?url'

export default function ExprVariables() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Sprite image={testImage} x='a + b' y='a * b' />
    </Atom.Skin>
  )
}
