import '../assets/Fonts/ScoreNumber.png'
import '../assets/Fonts/BPMNumber.png'
import '../assets/Fonts/StatNumber.png'

import bpmNumber from '../assets/Fonts/BPMNumber.fnt?url'
import scoreNumber from '../assets/Fonts/ScoreNumber.fnt?url'
import statNumber from '../assets/Fonts/StatNumber.fnt?url'
import infoBackground from '../assets/InfoPanel/Background.png?url'
import infoTemplate from '../assets/InfoPanel/Template.png?url'
import panelLeft from '../assets/NotePanel/Left.png?url'
import panelMiddle from '../assets/NotePanel/Middle.png?url'
import panelRight from '../assets/NotePanel/Right.png?url'
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
    <If keyName='p1_placement' value='left'>
      <Group>
        <Animation>
          <Keyframe t='0.25' x='-361' />
          <Keyframe t='0.6' x='0' ease='quadOut' />
        </Animation>
        <Sprite image={panelLeft} x='0' y='0' />
        <Group x='34' y='0'>
          <Use def='note-area' />
        </Group>
      </Group>
    </If>
  )
  const center = (
    <If keyName='p1_placement' value='center'>
      <Group x='455'>
        <Animation>
          <Keyframe t='0.25' alpha='0' />
          <Keyframe t='0.6' alpha='1' ease='quadOut' />
        </Animation>
        <Sprite image={panelMiddle} x='0' y='0' />
        <Group x='42' y='0'>
          <Use def='note-area' />
        </Group>
      </Group>
    </If>
  )
  const right = (
    <If keyName='p1_placement' value='right'>
      <Group>
        <Animation>
          <Keyframe t='0.25' x='1280' />
          <Keyframe t='0.6' x='919' ease='quadOut' />
        </Animation>
        <Sprite image={panelRight} x='0' y='0' />
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
      <Sprite image={infoBackground} />
      <Sprite image={infoTemplate} />
      <Text
        x='176'
        y='10'
        text='%s'
        data='p1_score'
        font-family='ScoreNumber'
        font-size='50px'
        font-src={scoreNumber}
        align='right'
      />
      <Text
        x='636'
        y='14'
        text='%s'
        data='p1_bpm'
        font-family='BPMNumber'
        font-size='45px'
        font-src={bpmNumber}
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
        y='26'
        text='%s'
        data='p1_stat_1'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='260'
        y='44'
        text='%s'
        data='p1_stat_2'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='260'
        y='62'
        text='%s'
        data='p1_stat_3'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='387'
        y='26'
        text='%s'
        data='p1_stat_4'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='387'
        y='44'
        text='%s'
        data='p1_stat_missed'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='387'
        y='62'
        text='%s'
        data='p1_stat_acc'
        font-family='StatNumber'
        font-size='14px'
        font-src={statNumber}
        align='right'
      />
      <Text
        x='1160'
        y='8'
        text='%s'
        data='p1_speed'
        font-family='ScoreNumber'
        font-size='50px'
        font-src={scoreNumber}
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
