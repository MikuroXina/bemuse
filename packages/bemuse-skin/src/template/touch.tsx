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

const WIDTH = 768
const HEIGHT = 928

function NotePanel() {
  return (
    <Group x={`${WIDTH / 2 - 185}`}>
      <Animation>
        <Keyframe t='0.25' alpha='0' />
        <Keyframe t='0.6' alpha='1' ease='quadOut' />
      </Animation>
      <Sprite image='Touch/NotePanel.png' x='0' y='0' />
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
      <Sprite image='Touch/Buttons/KNormal.png' x='0' y='0' ref={`p1_${n}`} />
      {children}
      <Sprite
        image='Touch/Buttons/KActive.png'
        x='-1'
        y='-1'
        alpha={`p1_${n}_active`}
      />
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
      <Sprite image='Touch/ButtonPanel.png' />
      <If key='p1_scratch' value='left'>
        <Group>
          <Group x={`${STYLES.scratch.width / 2}`}>
            <Use def='dxbuttons' />
          </Group>
          <Sprite
            image='Touch/Scratch/ScratchAreaL.png'
            x='0'
            y='8'
            ref='p1_SC'
          />
          <Sprite
            image='Touch/Scratch/ScratchGlowL.png'
            x='0'
            y='6'
            alpha='p1_SC_active'
          />
        </Group>
      </If>
      <If key='p1_scratch' value='right'>
        <Group>
          <Group x={`${-STYLES.scratch.width / 2}`}>
            <Use def='dxbuttons' />
          </Group>
          <Sprite
            image='Touch/Scratch/ScratchAreaR.png'
            x='674'
            y='8'
            ref='p1_SC'
          />
          <Sprite
            image='Touch/Scratch/ScratchGlowR.png'
            x='674'
            y='6'
            alpha='p1_SC_active'
          />
        </Group>
      </If>
      <If key='p1_scratch' value='off'>
        <Group>
          <KButton col={0} />
          <KButton col={1} />
          <KButton col={2} />
          <KButton col={4} />
          <KButton col={5} />
          <KButton col={6} />
          <Group x='147' y='180'>
            <Sprite image='Touch/Buttons/SNormal.png' x='0' y='0' ref='p1_4' />
            <Sprite
              image='Touch/Buttons/SActive.png'
              x='-1'
              y='-1'
              alpha='p1_4_active'
            />
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
      <Sprite image='Touch/Buttons/Normal.png' x='0' y='0' ref={`p1_${n}`} />
      {children}
      <Sprite
        image='Touch/Buttons/Active.png'
        x='-1'
        y='-1'
        alpha={`p1_${n}_active`}
      />
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
              font-src='Fonts/InfoSmall.fnt'
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_score'
              font-family=': "ScoreNumberSmall'
              font-src='Fonts/ScoreNumberSmall.fnt'
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
              font-src='Fonts/InfoSmall.fnt'
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_stat_acc'
              font-family='ScoreNumberSmall'
              font-src='Fonts/ScoreNumberSmall.fnt'
            />
          </Button>
          <Button i={0} row={0} n={4} />
          <Button i={1} row={1} n={5}>
            <Text
              x='75'
              y='32'
              text='Time'
              align='center'
              font-family='"InfoSmall'
              font-src='Fonts/InfoSmall.fnt'
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='song_time'
              font-family='InfoSmall'
              font-src='Fonts/InfoSmall.fnt'
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
              font-src='Fonts/InfoSmall.fnt'
            />
            <Text
              x='75'
              y='56'
              text='%s'
              align='center'
              data='p1_speed'
              font-family='ScoreNumberSmall'
              font-src='Fonts/ScoreNumberSmall.fnt'
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
