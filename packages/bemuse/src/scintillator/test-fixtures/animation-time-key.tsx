import { Atom } from '@bemuse/skin/index.js'

export default function AnimationTimeKey() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Group t='x'>
        <Atom.Animation>
          <Atom.Keyframe t='0' x='10' />
          <Atom.Keyframe t='1' x='20' />
        </Atom.Animation>
      </Atom.Group>
    </Atom.Skin>
  )
}
