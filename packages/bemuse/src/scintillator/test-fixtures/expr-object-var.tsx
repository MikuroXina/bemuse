import { Atom } from '@mikuroxina/bemuse-skin'

import testImage from './test.png?url'

export default function ExprObjectVar() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Object keyName='notes'>
        <Atom.Sprite image={testImage} x='10' y='y' />
      </Atom.Object>
    </Atom.Skin>
  )
}
