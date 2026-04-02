import { Atom } from '@mikuroxina/bemuse-skin'

export default function Animation() {
  return (
    <Atom.Skin width='123' height='456'>
      <Atom.Group y='t*2'>
        <Atom.Animation>
          <Atom.Keyframe t='0' x='10' />
          <Atom.Keyframe t='1' x='20' />
        </Atom.Animation>
        <Atom.Animation on='exitEvent'>
          <Atom.Keyframe t='0' x='50' y='0' />
          <Atom.Keyframe t='1' x='70' y='100' />
        </Atom.Animation>
      </Atom.Group>
    </Atom.Skin>
  )
}
