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
import { AllNoteArea, Tutorial } from '../common.js'

function NotePanel() {
  const left = (
    <If key='p1_placement' value='left'>
      <Group>
        <Animation>
          <Keyframe t='0.25' x='-361' />
          <Keyframe t='0.6' x='0' ease='quadOut' />
        </Animation>
        <Sprite image='NotePanel/Left.png' x='0' y='0' />
        <Group x='34' y='0'>
          <Use def='note-area' />
        </Group>
      </Group>
    </If>
  )
  const center = (
    <If key='p1_placement' value='center'>
      <Group x='455'>
        <Animation>
          <Keyframe t='0.25' alpha='0' />
          <Keyframe t='0.6' alpha='1' ease='quadOut' />
        </Animation>
        <Sprite image='NotePanel/Middle.png' x='0' y='0' />
        <Group x='42' y='0'>
          <Use def='note-area' />
        </Group>
      </Group>
    </If>
  )
  const right = (
    <If key='p1_placement' value='right'>
      <Group>
        <Animation>
          <Keyframe t='0.25' x='1280' />
          <Keyframe t='0.6' x='919' ease='quadOut' />
        </Animation>
        <Sprite image='NotePanel/Right.png' x='0' y='0' />
        <Group x='42' y='0'>
          <Use def='note-area' />
        </Group>
      </Group>
    </If>
  )
  return (
    <>
      {left}
      {center}
      {right}
    </>
  )
}

function InfoPanel() {
  return (
    <Group y='616'>
      <Animation>
        <Keyframe t='0' y='720' />
        <Keyframe t='0.3' y='616' ease='quadOut' />
      </Animation>
      <Sprite image='InfoPanel/Background.png' />
      <Sprite image='InfoPanel/Template.png' />
      <Text
        x='176'
        y='22'
        text='%s'
        data='p1_score'
        font-family='ScoreNumber'
        font-src='Fonts/ScoreNumber.fnt'
        alpha='right'
      />
      <Text
        x='636'
        y='22'
        text='%s'
        data='p1_bpm'
        font-family='BPMNumber'
        font-src='Fonts/BPMNumber.fnt'
        align='center'
      />
      <Text
        x='824'
        y='33'
        alpha='0.8'
        text='%s'
        data='song_title'
        font-weight='bold'
        font-size='16px'
        font-family='Robot'
        fill='white'
        align='left'
      />
      <Text
        x='824'
        y='55'
        alpha='0.6'
        text='%s'
        data='song_artist'
        font-size='13px'
        font-family='Roboto'
        fill='white'
        align='left'
      />
      <Text
        x='824'
        y='70'
        alpha='0.6'
        text='%s'
        data='song_time'
        font-size='13px'
        font-family='Roboto'
        fill='white'
        align='left'
      />
      <Text
        x='260'
        y='29'
        text='%s'
        data='p1_stat_1'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='260'
        y='47'
        text='%s'
        data='p1_stat_2'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='260'
        y='65'
        text='%s'
        data='p1_stat_3'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='387'
        y='29'
        text='%s'
        data='p1_stat_4'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='387'
        y='47'
        text='%s'
        data='p1_stat_missed'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='387'
        y='65'
        text='%s'
        data='p1_stat_acc'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='right'
      />
      <Text
        x='1160'
        y='22'
        text='%s'
        data='p1_speed'
        font-family='StatNumber'
        font-src='Fonts/StatNumber.fnt'
        align='left'
      />
    </Group>
  )
}

export function Screen() {
  return (
    <Skin
      width='1280'
      height='720'
      data-main-input-device='keyboard'
      data-info-panel-position='bottom'
    >
      <Defs>
        <AllNoteArea id='note-area' />
      </Defs>
      <NotePanel />
      <InfoPanel />
      <Tutorial width={1280} />
    </Skin>
  )
}
