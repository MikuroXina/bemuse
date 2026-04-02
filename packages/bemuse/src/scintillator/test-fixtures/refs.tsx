/* eslint-disable react/no-string-refs */
import { Atom } from '@mikuroxina/bemuse-skin'

import testImage from './test.png?url'

export default function Refs() {
  return (
    <Atom.Skin width='256' height='256'>
      <Atom.Sprite image={testImage} x='64' y='64' ref='a' />
    </Atom.Skin>
  )
}
