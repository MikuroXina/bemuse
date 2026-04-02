import { Atom } from '@mikuroxina/bemuse-skin'

export default function Defs() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Defs>
        <Atom.Group x='1 + 2 + 3' y='3 + 4' id='wow' />
      </Atom.Defs>
      <Atom.Use def='wow' />
      <Atom.Use def='wow' />
    </Atom.Skin>
  )
}
