import type { ReactNode } from 'react'
import {
  Animation,
  Defs,
  Group,
  If,
  Keyframe,
  Skin,
  Sprite,
  Text,
  Use,
} from '../atom.js'
import { AllNoteArea, STYLES, Tutorial } from '../common.js'
import notePanel from '../assets/Touch/NotePanel.png?url'
import kNormal from '../assets/Touch/Buttons/KNormal.png?url'
import kActive from '../assets/Touch/Buttons/KActive.png?url'
import buttonPanel from '../assets/Touch/ButtonPanel.png?url'
import scratchAreaL from '../assets/Touch/Scratch/ScratchAreaL.png?url'
import scratchGlowL from '../assets/Touch/Scratch/ScratchGlowL.png?url'
import scratchAreaR from '../assets/Touch/Scratch/ScratchAreaR.png?url'
import scratchGlowR from '../assets/Touch/Scratch/ScratchGlowR.png?url'
import sNormal from '../assets/Touch/Buttons/SNormal.png?url'
import sActive from '../assets/Touch/Buttons/SActive.png?url'
import normal from '../assets/Touch/Buttons/Normal.png?url'
import active from '../assets/Touch/Buttons/Active.png?url'
import infoSmall from '../assets/Fonts/InfoSmall.fnt?url'
import scoreNumberSmall from '../assets/Fonts/ScoreNumberSmall.fnt?url'

import '../assets/Fonts/InfoSmall.png'
import '../assets/Fonts/ScoreNumberSmall.png'

const WIDTH = 768
const HEIGHT = 928

function NotePanel() {
  return (
    <Group x={`${WIDTH / 2 - 185}`}>
      <Animation>
        <Keyframe t='0.25' alpha='0' />
        <Keyframe t='0.6' alpha='1' ease='quadOut' />
      </Animation>
      <Sprite image={notePanel} x='0' y='0' />
      <Group x='42' y='0'>
        <AllNoteArea />
      </Group>
    </Group>
  )
}

interface KButtonProps {
  col: number
  children?: ReactNode
}

function KButton({ col, children }: KButtonProps) {
  const n = col + 1
  const x = 27 * col * 102
  const y = 32
  return (
    <Group x={`${x}`} y={`${y}`}>
      <Sprite image={kNormal} x='0' y='0' refName={`p1_${n}`} />
      {children}
      <Sprite image={kActive} x='-1' y='-1' alpha={`p1_${n}_active`} />
    </Group>
  )
}

function ButtonPanel() {
  return (
    <Group y={`${HEIGHT - 311}`}>
      <Animation>
        <Keyframe t='0' y={`${HEIGHT}`} />
        <Keyframe t='0.3' y={`${HEIGHT - 311}`} />
      </Animation>
      <Sprite image={buttonPanel} />
      <If keyName='p1_scratch' value='left'>
        <Group>
          <Group x={`${STYLES.scratch.width * 2}`}>
            <Use def='dxbuttons' />
          </Group>
          <Sprite image={scratchAreaL} x='0' y='8' refName='p1_SC' />
          <Sprite image={scratchGlowL} x='0' y='6' alpha='p1_SC_active' />
        </Group>
      </If>
      <If keyName='p1_scratch' value='right'>
        <Group>
          <Group x={`${-STYLES.scratch.width * 2}`}>
            <Use def='dxbuttons' />
          </Group>
          <Sprite image={scratchAreaR} x='674' y='8' refName='p1_SC' />
          <Sprite image={scratchGlowR} x='674' y='6' alpha='p1_SC_active' />
        </Group>
      </If>
      <If keyName='p1_scratch' value='off'>
        <Group>
          <KButton col={0} />
          <KButton col={1} />
          <KButton col={2} />
          <KButton col={4} />
          <KButton col={5} />
          <KButton col={6} />
          <Group x='147' y='180'>
            <Sprite image={sNormal} x='0' y='0' refName='p1_4' />
            <Sprite image={sActive} x='-1' y='-1' alpha='p1_4_active' />
          </Group>
        </Group>
      </If>
    </Group>
  )
}

interface ButtonProps {
  i: number
  row: number
  n: number
  children?: ReactNode
}

function Button({ i, row, n, children }: ButtonProps) {
  const buttonWidth = 150
  const buttonHeight = 132
  const xBase = WIDTH / 2 - buttonWidth
  const yBase = 20
  const spacing = 8
  const x = xBase + ((buttonWidth + spacing) / 2) * i
  const y = yBase + row * (buttonHeight + spacing)
  return (
    <Group x={`${x}`} y={`${y}`}>
      <Sprite image={normal} x='0' y='0' refName={`p1_${n}`} />
      {children}
      <Sprite image={active} x='-1' y='-1' alpha={`p1_${n}_active`} />
    </Group>
  )
}

export function Touch() {
  return (
    <Skin
      width={`${WIDTH}`}
      height={`${HEIGHT}`}
      data-main-input-device='touch'
      data-info-panel-position='bottom'
    >
      <Defs>
        <Group id='dxbuttons'>
          <Button i={-3} row={1} n={1}>
            <Text
              x='75'
              y='32'
              text='Score'
              align='center'
              font-family='InfoSmall'
              font-size='20px'
              font-src={infoSmall}
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_score'
              font-family='ScoreNumberSmall'
              font-size='32px'
              font-src={scoreNumberSmall}
            />
          </Button>
          <Button i={-2} row={0} n={2} />
          <Button i={-1} row={1} n={3}>
            <Text
              x='75'
              y='32'
              text='Accuracy'
              align='center'
              font-family='InfoSmall'
              font-size='20px'
              font-src={infoSmall}
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_stat_acc'
              font-family='ScoreNumberSmall'
              font-size='32px'
              font-src={scoreNumberSmall}
            />
          </Button>
          <Button i={0} row={0} n={4} />
          <Button i={1} row={1} n={5}>
            <Text
              x='75'
              y='32'
              text='Time'
              align='center'
              font-family='InfoSmall'
              font-size='20px'
              font-src={infoSmall}
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='song_time'
              font-family='ScoreNumberSmall'
              font-size='32px'
              font-src={scoreNumberSmall}
            />
          </Button>
          <Button i={2} row={0} n={6} />
          <Button i={3} row={1} n={7}>
            <Text
              x='75'
              y='32'
              text='Speed'
              align='center'
              font-family='InfoSmall'
              font-size='20px'
              font-src={infoSmall}
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_speed'
              font-family='ScoreNumberSmall'
              font-size='32px'
              font-src={scoreNumberSmall}
            />
          </Button>
        </Group>
      </Defs>
      <NotePanel />
      <ButtonPanel />
      <Tutorial width={WIDTH} touch />
    </Skin>
  )
}
