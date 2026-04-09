import { Atom } from '@bemuse/skin/index.js'

export default function GroupMask() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Group mask='50x70+10+15' />
    </Atom.Skin>
  )
}
