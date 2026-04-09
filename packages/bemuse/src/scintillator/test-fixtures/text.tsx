import { Atom } from '@bemuse/skin/index.js'

import desyrel from './fonts/desyrel.fnt?url'

export default function Text() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Text
        font-family='Desyrel'
        font-size='70px'
        font-src={desyrel}
        text='Hello world'
      />
    </Atom.Skin>
  )
}
