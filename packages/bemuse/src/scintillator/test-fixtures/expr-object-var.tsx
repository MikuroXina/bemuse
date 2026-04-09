import { Atom } from '@bemuse/skin/index.js'

import testImage from './test.png?url'

export default function ExprObjectVar() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Particle keyName='notes'>
        <Atom.Sprite image={testImage} x='10' y='y' />
      </Atom.Particle>
    </Atom.Skin>
  )
}
