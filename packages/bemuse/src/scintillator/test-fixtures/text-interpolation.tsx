import { Atom } from '@mikuroxina/bemuse-skin'

import desyrel from './fonts/desyrel.fnt?url'

export default function TextInterpolation() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Text
        font-family='Desyrel'
        font-src={desyrel}
        text='Hello world %s'
        data='lol'
      />
    </Atom.Skin>
  )
}
