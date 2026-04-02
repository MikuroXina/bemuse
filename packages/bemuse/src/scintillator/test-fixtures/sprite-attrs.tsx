import { Atom } from '@mikuroxina/bemuse-skin'

import testImage from './test.png?url'

export default function SpriteAttrs() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Sprite
        image={testImage}
        width='1+2'
        height='4-3'
        frame='10x11+12+13'
        visible='!1'
        blend='screen'
      />
    </Atom.Skin>
  )
}
