import { Atom } from '@mikuroxina/bemuse-skin'

export default function ExprBasic() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Group x='1 + 2 + 3' y='3 + 4' />
    </Atom.Skin>
  )
}
