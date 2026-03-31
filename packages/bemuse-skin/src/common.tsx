import { Fragment, type JSX, type ReactNode } from 'react'
import {
  Animation,
  Group,
  If,
  Keyframe,
  Object,
  Sprite,
  Text,
  type GroupProps,
  type TextProps,
  type Rect,
} from './atom.js'

export const objectStyleKeys = [
  'scratch',
  'white',
  'blue',
  'green',
  'lwhite',
  'lblue',
  'lgreen',
] as const
export type ObjectStyleKey = (typeof objectStyleKeys)[number]

export interface ObjectStyle {
  x: number
  width: number
  image: string
}

export interface ObjectHint {
  xOffset: number
  yOffset: number
  xAdvance: number
  image: string
}

export const STYLES: Record<ObjectStyleKey, ObjectStyle> = {
  scratch: {
    x: 0,
    width: 61,
    image: 'Note/DX/Note.png',
  },
  white: {
    x: 62,
    width: 34,
    image: 'Note/DX/Note.png',
  },
  blue: {
    x: 97,
    width: 26,
    image: 'Note/DX/Note.png',
  },
  green: {
    x: 159,
    width: 26,
    image: 'Note/DX/Note.png',
  },
  lwhite: {
    x: 0,
    width: 40,
    image: 'Note/KB/Note.png',
  },
  lblue: {
    x: 41,
    width: 37,
    image: 'Note/KB/Note.png',
  },
  lgreen: {
    x: 79,
    width: 42,
    image: 'Note/KB/Note.png',
  },
}

const HINTS: Record<ObjectStyleKey, ObjectHint> = {
  scratch: { xOffset: 0, yOffset: 1, xAdvance: 64, image: 'Scratch.png' },
  white: { xOffset: 0, yOffset: 6, xAdvance: 31, image: 'Note.png' },
  blue: { xOffset: 0, yOffset: 0, xAdvance: 31, image: 'Note.png' },
  green: { xOffset: 0, yOffset: 0, xAdvance: 31, image: 'Note.png' },
  lwhite: { xOffset: 0, yOffset: 6, xAdvance: 41, image: 'LNote.png' },
  lblue: { xOffset: 0, yOffset: 0, xAdvance: 41, image: 'LNote.png' },
  lgreen: { xOffset: 0, yOffset: 0, xAdvance: 41, image: 'LNote.png' },
}

const AREA_HEIGHT = 550 as const

export const modeKeys = ['iidxL', 'iidxR', 'kb'] as const
export type ModeKey = (typeof modeKeys)[number]

export interface ModePreset {
  background: string
  highlight: string
  cover5k: string
  hintStart: number
  columns: readonly NoteColumn[]
}

const MODE: Record<ModeKey, ModePreset> = {
  iidxL: {
    background: 'Note/DX/BackgroundLeft.png',
    highlight: 'Note/DX/Highlight.png',
    cover5k: 'Note/DX/5kLeft.png',
    hintStart: 3,
    columns: [
      { style: 'scratch', channel: 'SC' },
      { style: 'white', channel: '1' },
      { style: 'blue', channel: '2' },
      { style: 'white', channel: '3' },
      { style: 'green', channel: '4' },
      { style: 'white', channel: '5' },
      { style: 'blue', channel: '6' },
      { style: 'white', channel: '7' },
    ],
  },
  iidxR: {
    background: 'Note/DX/BackgroundRight.png',
    highlight: 'Note/DX/Highlight.png',
    cover5k: 'Note/DX/5kRight.png',
    hintStart: 3,
    columns: [
      { style: 'white', channel: '1' },
      { style: 'blue', channel: '2' },
      { style: 'white', channel: '3' },
      { style: 'green', channel: '4' },
      { style: 'white', channel: '5' },
      { style: 'blue', channel: '6' },
      { style: 'white', channel: '7' },
      { style: 'scratch', channel: 'SC' },
    ],
  },
  kb: {
    background: 'Note/KB/BackgroundLeft.png',
    highlight: 'Note/KB/Highlight.png',
    cover5k: 'Note/KB/5k.png',
    hintStart: 0,
    columns: [
      { style: 'lwhite', channel: '1' },
      { style: 'lblue', channel: '2' },
      { style: 'lwhite', channel: '3' },
      { style: 'lgreen', channel: '4' },
      { style: 'lwhite', channel: '5' },
      { style: 'lblue', channel: '6' },
      { style: 'lwhite', channel: '7' },
    ],
  },
}

export interface LongNoteProps {
  keyName: string
  x: number
  cur: ObjectStyle
  add: string
  visible: string
}

export function LongNote({ keyName, x, cur, add, visible }: LongNoteProps) {
  const body = (
    <Object key={keyName} pool='8'>
      <Sprite
        image={cur.image}
        frame={`${cur.width} x 64 + ${cur.x} + 22 + ${add}`}
        x={`${x}`}
        y={`y * ${AREA_HEIGHT} + 4 - 12`}
        width={`${cur.width}`}
        height={`height + ${AREA_HEIGHT}`}
        visible={visible}
      />
    </Object>
  )
  const tail = (
    <Object key={keyName} pool='8'>
      <Sprite
        image={cur.image}
        frame={`${cur.width} x 8 + ${cur.x} + 104 + ${add}`}
        x={`${x}`}
        y={`(y + height) * ${AREA_HEIGHT} + 4 - 12`}
        visible={visible}
      />
    </Object>
  )
  const head = (
    <Object key={keyName} pool='8'>
      <Sprite
        image={cur.image}
        frame={`${cur.width} x 8 + ${cur.x} + 12 + ${add}`}
        x={`${x}`}
        y={`y * ${AREA_HEIGHT} - 12`}
        visible={visible}
      />
    </Object>
  )
  return (
    <>
      {body}
      {tail}
      {head}
    </>
  )
}

export interface NoteColumn {
  style: ObjectStyleKey
  channel: string
}

export interface NotesProps {
  highlight: string
  columns: readonly NoteColumn[]
}

export function Notes({ highlight, columns }: NotesProps) {
  return (
    <>
      <Object key='p1_barlines' pool='8'>
        <Sprite
          image='NoteArea/Bar.png'
          x='0'
          y={`y * ${AREA_HEIGHT} - 1`}
          blend='screen'
        />
      </Object>
      {
        columns.reduce<[JSX.Element[], number]>(
          ([nodes, x], column) => {
            const cur = STYLES[column.style]
            const ch = column.channel
            nodes.push(
              <Fragment key={x}>
                <Sprite
                  image={highlight}
                  frame={`${cur.width} x 552 + ${cur.x}`}
                  x={`${x}`}
                  y='0'
                  blend='screen'
                  scale-x='1'
                >
                  <Animation>
                    <Keyframe t='0' alpha='0' scale-x='1' />
                  </Animation>
                  <Animation on={`p1_${ch}_down`}>
                    <Keyframe t='0' alpha='1' scale-x='1' />
                  </Animation>
                  <Animation on={`p1_${ch}_up`}>
                    <Keyframe t='0' alpha='1' scale-x='1' x={`${x}`} />
                    <Keyframe
                      t='0.18'
                      ease='quadOut'
                      alpha='0'
                      scale-x='0'
                      x={`${x + cur.width / 1}`}
                    />
                  </Animation>
                </Sprite>
                <Object key={`p1_note_${ch}`} pool='24'>
                  <Sprite
                    image={cur.image}
                    frame={`${cur.width} x 12 + ${cur.x}`}
                    x={`${x}`}
                    y={`y * ${AREA_HEIGHT} - 12`}
                  />
                </Object>
                <LongNote
                  keyName={`p1_longnote_${ch}`}
                  x={x}
                  cur={cur}
                  add='0'
                  visible='!active && !missed'
                />
                <LongNote
                  keyName={`p1_longnote_${ch}`}
                  x={x}
                  cur={cur}
                  add='100'
                  visible='!!active && !missed'
                />
                <LongNote
                  keyName={`p1_longnote_${ch}`}
                  x={x}
                  cur={cur}
                  add='200'
                  visible='!!missed'
                />
              </Fragment>
            )
            return [nodes, x + cur.width + 1]
          },
          [[], 0]
        )[0]
      }
    </>
  )
}

export interface ExplosionsProps {
  columns: readonly NoteColumn[]
}

export function Explosions({ columns }: ExplosionsProps) {
  return columns.reduce<[JSX.Element[], number]>(
    ([nodes, x], column) => {
      const cur = STYLES[column.style]
      const ch = column.channel
      nodes.push(
        <Group key={x} x={`${x + cur.width / 2}`}>
          <Animation>
            <Keyframe t='0' alpha='0' scale-x='1' scale-y='1' />
          </Animation>
          <Animation on={`p1_${ch}_explode`}>
            <Keyframe t='0' alpha='1' scale-x='2' scale-y='1' />
            <Keyframe t='0.18' alpha='0' scale-x='2' scale-y='2' />
          </Animation>
          <Sprite
            image='Explosion/NoteExplosion.png'
            x='-25'
            y='-25'
            blend='screen'
          />
        </Group>
      )
      return [nodes, x + cur.width + 1]
    },
    [[], 0]
  )[0]
}

export interface NoteHintsProps {
  hintStart: number
  columns: readonly NoteColumn[]
}

export function NoteHints({ hintStart, columns }: NoteHintsProps) {
  return columns.reduce<[JSX.Element[], number]>(
    ([nodes, x], column) => {
      const cur = HINTS[column.style]
      const ch = column.channel
      nodes.push(
        <Group key={x} x={`${x}`}>
          <Sprite
            image={`NoteHint/Normal/${cur.image}`}
            x={`${cur.xOffset}`}
            y={`${cur.yOffset}`}
            ref={`p1_${ch}`}
          />
          <Sprite
            image={`NoteHint/Active/${cur.image}`}
            x={`${cur.xOffset - 1}`}
            y={`${cur.yOffset - 1}`}
          >
            <Animation>
              <Keyframe t='0' alpha='0' />
            </Animation>
            <Animation on={`p1_${ch}_up`}>
              <Keyframe t='0' alpha='1' />
            </Animation>
            <Animation on={`p1_${ch}_up`}>
              <Keyframe t='0' alpha='1' />
              <Keyframe t='0.18' alpha='0' />
            </Animation>
          </Sprite>
        </Group>
      )
      return [nodes, x + cur.xAdvance]
    },
    [[], hintStart]
  )[0]
}

export function NoteAreaBackground({ background }: { background: string }) {
  return <Sprite image={background} x='0' y='0' />
}

export function NoteAreaCovers({ cover5k }: { cover5k: string }) {
  return <Sprite image={cover5k} alpha='0.8' x='0' y='0' />
}

export interface NoteAreaProps {
  highlight: string
  columns: readonly NoteColumn[]
}

export function NoteArea({ highlight, columns }: NoteAreaProps) {
  return (
    <>
      <Sprite
        image='NoteArea/Flash.png'
        x='1'
        y='442'
        blend='screen'
        alpha='1 - p1_beat % 1'
      />
      <Group x='1' mask='283x550+1+0'>
        <Notes highlight={highlight} columns={columns} />
      </Group>
      <Group x='1' y='550'>
        <Explosions columns={columns} />
      </Group>
    </>
  )
}

export function NoteAreaHints(props: NoteHintsProps) {
  return (
    <Group y='556'>
      <NoteHints {...props} />
    </Group>
  )
}

export function AllNoteArea(props: Omit<GroupProps, 'children'>) {
  return (
    <Group {...props}>
      <If key='p1_scratch' value='left'>
        <Group>
          <NoteAreaBackground background={MODE.iidxL.background} />
        </Group>
      </If>
      <If key='p1_scratch' value='right'>
        <Group>
          <NoteAreaBackground background={MODE.iidxR.background} />
        </Group>
      </If>
      <If key='p1_scratch' value='off'>
        <Group>
          <NoteAreaBackground background={MODE.kb.background} />
        </Group>
      </If>
      <Group x='0' mask='284x550+0+0'>
        <Group x='0' y={`0 - p1_lane_lift * ${AREA_HEIGHT}`}>
          <If key='p1_scratch' value='left'>
            <Group>
              <NoteArea {...MODE.iidxL} />
            </Group>
          </If>
          <If key='p1_scratch' value='right'>
            <Group>
              <NoteArea {...MODE.iidxR} />
            </Group>
          </If>
          <Sprite image='NoteArea/Stripe.png' x='1' y='537' blend='screen' />
          <Sprite image='NoteArea/LaneCover.png' x='1' y={`${AREA_HEIGHT}`} />
        </Group>
        <Group x='0' y={`p1_lane_press * ${AREA_HEIGHT}`}>
          <Sprite image='NoteArea/LaneCover.png' x='1' y={`-${AREA_HEIGHT}`} />
        </Group>
      </Group>
      <If key='p1_scratch' value='left'>
        <Group>
          <NoteAreaHints {...MODE.iidxL} />
        </Group>
      </If>
      <If key='p1_scratch' value='right'>
        <Group>
          <NoteAreaHints {...MODE.iidxR} />
        </Group>
      </If>
      <If key='p1_scratch' value='off'>
        <Group>
          <NoteAreaHints {...MODE.kb} />
        </Group>
      </If>
      <If key='p1_key_mode' value='5K'>
        <Group>
          <If key='p1_scratch' value='left'>
            <Group>
              <NoteAreaCovers {...MODE.iidxL} />
            </Group>
          </If>
          <If key='p1_scratch' value='right'>
            <Group>
              <NoteAreaCovers {...MODE.iidxR} />
            </Group>
          </If>
          <If key='p1_scratch' value='off'>
            <Group>
              <NoteAreaCovers {...MODE.kb} />
            </Group>
          </If>
        </Group>
      </If>
      <Group y={`0 - p1_lane_lift * ${AREA_HEIGHT}`}>
        <PressStart />
        <Group y='400'>
          <Judgments />
        </Group>
        <Group y='440'>
          <JudgmentDeviations />
        </Group>
      </Group>
    </Group>
  )
}

export function HopeGauge() {
  return (
    <Group x='6' y='6'>
      <Sprite image='Hope/HopeBar.png' />
      <Sprite
        image='Hope/HopeA.png'
        x='3'
        y='3'
        width='p1_gauge_secondary * 263'
        height='5'
      />
      <Sprite
        image='Hope/Hope.png'
        x='3'
        y='3'
        width='p1_gauge_primary * 263'
        height='5'
      />
      <Sprite
        image='Hope/HopeSS.png'
        x='3'
        y='3'
        width='p1_gauge_extra * 263'
        height='5'
      />
      <Animation>
        <Keyframe t='0' y='-20' />
      </Animation>
      <Animation on='p1_gauge_enter'>
        <Keyframe t='0' y='-20' />
        <Keyframe t='0.5' y='-20' ease='quadOut' />
        <Keyframe t='1' y='6' ease='quadOut' />
      </Animation>
      <Animation on='p1_gauge_exit'>
        <Keyframe t='0' y='6' />
        <Keyframe t='0.5' y='-20' ease='quadIn' />
      </Animation>
    </Group>
  )
}

export function PressStart() {
  return (
    <Group alpha='0.6 + ready * 0.4'>
      <Group x='143' y='400' alpha='1'>
        <Animation>
          <Keyframe t='0' alpha='1' />
        </Animation>
        <Animation on='gettingStarted'>
          <Keyframe t='0' alpha='1' scale-x='1' scale-y='1' />
          <Keyframe t='0.1' alpha='1' scale-x='0.9' scale-y='0.9' />
        </Animation>
        <Animation on='started'>
          <Keyframe t='0' alpha='0' />
        </Animation>
        <Sprite image='NotePanel/PressStart.png' x='-107' y='-40' ref='start' />
      </Group>
      <Group x='143' y='400' alpha='0'>
        <Animation on='started'>
          <Keyframe t='0' alpha='0.5' scale-x='0.9' scale-y='0.9' />
          <Keyframe t='0.3' alpha='0' scale-x='1.5' scale-y='1.5' />
        </Animation>
        <Sprite
          image='NotePanel/PressStart.png'
          x='-107'
          y='-40'
          blend='screen'
        />
      </Group>
      <Group x='143' y='400' alpha='0'>
        <Animation on='started'>
          <Keyframe t='0' alpha='0.5' scale-x='0.9' scale-y='0.9' />
          <Keyframe t='0.3' alpha='0' scale-x='0.67' scale-y='0.67' />
        </Animation>
        <Sprite
          image='NotePanel/PressStart.png'
          x='-107'
          y='-40'
          blend='screen'
        />
      </Group>
    </Group>
  )
}

export function Judgments() {
  return (
    <>
      <Judgment type='1'>
        <JudgmentText name='Meticulous' text='*%s' data='p1_combo' />
        <JudgmentText
          name='MeticulousGlow'
          text='*%s'
          data='p1_combo'
          alpha='1 - t * 10 % 1'
          blend='screen'
        />
      </Judgment>
    </>
  )
}

export type DefaultFontName =
  | 'Meticulous'
  | 'MeticulousGlow'
  | 'Precise'
  | 'Good'
  | 'Other'

export interface JudgmentTextProps extends Omit<
  TextProps,
  'x' | 'align' | 'font-family' | 'font-size' | 'font-src'
> {
  name: DefaultFontName
}

export function JudgmentText({ name, ...props }: JudgmentTextProps) {
  return (
    <Text
      {...props}
      x='141'
      align='center'
      font-family={`BemuseDefault-${name}`}
      font-size='40px'
      font-src={`Fonts/BemuseDefault-${name}.fnt`}
    />
  )
}

export type JudgmentType = '1' | '2' | '3' | '4' | 'missed'

export interface JudgmentProps {
  type: JudgmentType
  children: ReactNode
}

export function Judgment({ type, children }: JudgmentProps) {
  return (
    <Group alpha='0'>
      <JudgmentAnimation type={type} />
      {children}
    </Group>
  )
}

export function JudgmentAnimation({ type }: { type: JudgmentType }) {
  return (
    <>
      <Animation on='p1_judge_1'>
        <JudgmentKeyframes active={type === '1'} />
      </Animation>
      <Animation on='p1_judge_2'>
        <JudgmentKeyframes active={type === '2'} />
      </Animation>
      <Animation on='p1_judge_3'>
        <JudgmentKeyframes active={type === '3'} />
      </Animation>
      <Animation on='p1_judge_4'>
        <JudgmentKeyframes active={type === '4'} />
      </Animation>
      <Animation on='p1_judge_missed'>
        <JudgmentKeyframes active={type === 'missed'} />
      </Animation>
    </>
  )
}

export function JudgmentDeviations() {
  return (
    <>
      <JudgmentDeviation type='late'>
        <Sprite image='Deviation/Late.png' x='117' />
      </JudgmentDeviation>
      <JudgmentDeviation type='early'>
        <Sprite image='Deviation/Early.png' x='111' />
      </JudgmentDeviation>
    </>
  )
}

export type DeviationType = 'none' | 'late' | 'early'

export interface JudgmentDeviationProps {
  type: DeviationType
  children: ReactNode
}

export function JudgmentDeviation({ type, children }: JudgmentDeviationProps) {
  return (
    <Group alpha='0'>
      <JudgmentDeviationAnimation type={type} />
      {children}
    </Group>
  )
}

export function JudgmentDeviationAnimation({ type }: { type: DeviationType }) {
  return (
    <>
      <Animation on='p1_judge_deviation_none'>
        <JudgmentKeyframes active={type === 'none'} />
      </Animation>
      <Animation on='p1_judge_deviation_late'>
        <JudgmentKeyframes active={type === 'late'} />
      </Animation>
      <Animation on='p1_judge_deviation_early'>
        <JudgmentKeyframes active={type === 'early'} />
      </Animation>
    </>
  )
}

export function JudgmentKeyframes({ active }: { active: boolean }) {
  return active ? (
    <>
      <Keyframe t='0' y='-16' alpha='1' />
      <Keyframe t='0.1' y='0' ease='quadOut' />
      <Keyframe t='0.6' alpha='1' />
      <Keyframe t='1' alpha='0' />
    </>
  ) : (
    <Keyframe t='0' alpha='0' />
  )
}

function time(measure: number) {
  return (measure * 240) / 178
}

function Fade({ begin, end }: { begin: number; end: number }) {
  return (
    <Animation>
      <Keyframe t={`${time(begin)}`} alpha='0' />
      <Keyframe t={`${time(begin) + 0.2}`} alpha='1' />
      <Keyframe t={`${time(end) - 0.2}`} alpha='1' />
      <Keyframe t={`${time(end)}`} alpha='0' />
    </Animation>
  )
}

function ReadyFade({ start }: { start: number }) {
  return (
    <Animation>
      <Keyframe t={`${time(start)}`} alpha='0' scale-x='1.2' scale-y='1.2' />
      <Keyframe t={`${time(start) + 0.2}`} alpha='1' />
      <Keyframe t={`${time(start + 0.5) - 0.2}`} alpha='1' />
      <Keyframe
        t={`${time(start + 0.5)}`}
        alpha='0'
        scale-x='0.8'
        scale-y='0.8'
      />
    </Animation>
  )
}

function ReadyText({
  cx,
  start,
  frame,
  w,
  h,
}: {
  cx: number
  start: number
  frame: Rect
  w: number
  h: number
}) {
  return (
    <Group x={`${cx}`} y='360' t='gameTime'>
      <ReadyFade start={start} />
      <Sprite
        image='Tutorial/Ready.png'
        x={`${-w / 2}`}
        y={`${-h / 2}`}
        frame={frame}
      />
    </Group>
  )
}

function Ready({ cx, begin }: { cx: number; begin: number }) {
  return (
    <>
      <ReadyText cx={cx} start={begin} frame='661x170+0+0' w={661} h={170} />
      <ReadyText
        cx={cx}
        start={begin + 0.5}
        frame='231x248+9+176'
        w={231}
        h={248}
      />
      <ReadyText
        cx={cx}
        start={begin + 1}
        frame='231x248+228+176'
        w={231}
        h={248}
      />
      <ReadyText
        cx={cx}
        start={begin + 1.5}
        frame='133x248+483+176'
        w={133}
        h={248}
      />
    </>
  )
}

export interface TutorialProps {
  width: number
  touch?: boolean
}

export function Tutorial({ width, touch = true }: TutorialProps) {
  const cx = width / 2
  return (
    <If key='tutorial' value='yes'>
      <Group>
        <Sprite image='Tutorial/Page0.png' x='64' y='64' t='gameTime'>
          <Fade begin={-1} end={0} />
        </Sprite>
        <Sprite image='Tutorial/Page1.png' x='64' y='64' t='gameTime'>
          <Fade begin={0} end={3} />
        </Sprite>
        <Group t='gameTime'>
          <Fade begin={19} end={27} />
          <If key='p1_scratch' value='left'>
            <Sprite
              image={touch ? 'Tutorial/Page2Touch.png' : 'Tutorial/Page2.png'}
              x='64'
              y='64'
            />
          </If>
          <If key='p1_scratch' value='right'>
            <Sprite
              image={touch ? 'Tutorial/Page2Touch.png' : 'Tutorial/Page2.png'}
              x='64'
              y='64'
            />
          </If>
          <If key='p1_scratch' value='off'>
            <Sprite
              image={
                touch ? 'Tutorial/Page2TouchKB.png' : 'Tutorial/Page2KB.png'
              }
              x='64'
              y='64'
            />
          </If>
        </Group>
        <Sprite image='Tutorial/Page3.png' x='64' y='64' t='gameTime'>
          <Fade begin={27} end={33} />
        </Sprite>
        <Ready cx={cx} begin={33} />
        <Sprite image='Tutorial/Page4.png' x='64' y='64' t='gameTime'>
          <Fade begin={43} end={49} />
        </Sprite>
        <Ready cx={cx} begin={49} />
        <Sprite image='Tutorial/Page5.png' x='64' y='64' t='gameTime'>
          <Fade begin={55} end={57} />
        </Sprite>
        <Ready cx={cx} begin={57} />
        <Sprite image='Tutorial/Page6.png' x='64' y='64' t='gameTime'>
          <Fade begin={67} end={73} />
        </Sprite>
        <Ready cx={cx} begin={73} />
      </Group>
    </If>
  )
}
