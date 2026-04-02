import { Atom } from '@mikuroxina/bemuse-skin'

import desyrel from './fonts/desyrel.fnt?url'

export default function TextCenter() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Text
        font-family='Desyrel'
        font-size='70px'
        font-src={desyrel}
        text='Hello world'
        align='center'
      />
    </Atom.Skin>
  )
}
