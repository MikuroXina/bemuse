import '../assets/Fonts/ScoreNumber.png'
import '../assets/Fonts/StatNumber.png'

import noteExplosion from '../assets/Explosion/NoteExplosion.png?url'
import scoreNumber from '../assets/Fonts/ScoreNumber.fnt?url'
import statNumber from '../assets/Fonts/StatNumber.fnt?url'
import infoBackground from '../assets/InfoPanel/Background.png?url'
import infoTemplate from '../assets/InfoPanel/Template.png?url'
import bar from '../assets/NoteArea/Bar.png?url'
import flash from '../assets/Touch3DMode/Flash.png?url'
import lane from '../assets/Touch3DMode/Lane.png?url'
import noteBlue from '../assets/Touch3DMode/NoteBlue.png?url'
import noteGreen from '../assets/Touch3DMode/NoteGreen.png?url'
import noteWhite from '../assets/Touch3DMode/NoteWhite.png?url'
import {
  Animation,
  Group,
  Keyframe,
  Particle,
  Skin,
  Sprite,
  Text,
} from '../atom.js'
import {
  HopeGauge,
  JudgmentDeviations,
  Judgments,
  PressStart,
  Tutorial,
} from '../common.js'

function MyNote({ column, file }: { column: number; file: string }) {
  return (
    <>
      <Sprite
        image={
          new URL(
            `../assets/Touch3DMode/Highlight${column}.png`,
            import.meta.url
          ).href
        }
        blend='screen'
      >
        <Animation>
          <Keyframe t='0' alpha='0' />
        </Animation>
        <Animation on={`p1_${column}_down`}>
          <Keyframe t='0' alpha='1' />
        </Animation>
        <Animation on={`p1_${column}_up`}>
          <Keyframe t='0' alpha='1' />
          <Keyframe t='0.18' ease='quadOut' alpha='0' />
        </Animation>
      </Sprite>
      <Particle keyName={`p1_note3d_${column}`} pool='24'>
        <Sprite
          image={file}
          x='x'
          y='y'
          anchor-x='0.5'
          anchor-y='1'
          scale-x='width / 26.5'
          scale-y='width / 28'
        />
      </Particle>
      <Group x={`${560 * (((column - 0.5) / 7) * 2 - 1) + 1280 / 2}`} y='689'>
        <Animation>
          <Keyframe t='0' alpha='0' scale-x='2' scale-y='2' />
        </Animation>
        <Animation on={`p1_${column}_explode`}>
          <Keyframe t='0' alpha='1' scale-x='4' scale-y='2' />
          <Keyframe t='0.18' alpha='0' scale-x='4' scale-y='4' />
        </Animation>
        <Sprite image={noteExplosion} x='-25' y='-25' blend='screen' />
      </Group>
    </>
  )
}

export function Touch3d() {
  return (
    <Skin
      width='1280'
      height='720'
      data-display-mode='touch3d'
      data-main-input-device='touch'
      data-info-panel-position='top'
    >
      <Group y='-12'>
        <Animation>
          <Keyframe t='0' y='-104' />
          <Keyframe t='0.3' y='-12' ease='quadOut' />
        </Animation>
        <Sprite image={infoBackground} />
        <Sprite image={infoTemplate} y='1' />
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
          x='824'
          y='33'
          alpha='0.8'
          text='%s'
          data='song_title'
          font-weight='bold'
          font-size='16px'
          font-family='Roboto'
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
          x='1160'
          y='10'
          text='%s'
          data='p1_speed'
          font-family='ScoreNumber'
          font-size='50px'
          font-src={scoreNumber}
          align='left'
        />
        <Text
          x='1099'
          y='29'
          text='%s'
          data='p1_bpm'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='left'
        />
        <Text
          x='260'
          y='27'
          text='%s'
          data='p1_stat_1'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
        <Text
          x='260'
          y='45'
          text='%s'
          data='p1_stat_2'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
        <Text
          x='260'
          y='63'
          text='%s'
          data='p1_stat_3'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
        <Text
          x='387'
          y='27'
          text='%s'
          data='p1_stat_4'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
        <Text
          x='387'
          y='45'
          text='%s'
          data='p1_stat_missed'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
        <Text
          x='387'
          y='63'
          text='%s'
          data='p1_stat_acc'
          font-family='StatNumber'
          font-size='14px'
          font-src={statNumber}
          align='right'
        />
      </Group>
      <Group>
        <Animation>
          <Keyframe t='0.25' alpha='0' />
          <Keyframe t='0.6' alpha='1' ease='quadOut' />
        </Animation>
        <Sprite image={lane} x='0' y='0' />
        <Sprite
          image={flash}
          x='0'
          y='0'
          blend='screen'
          alpha='1 - p1_beat % 1'
        />
        <Particle keyName='p1_barlines3d' pool='24'>
          <Sprite
            image={bar}
            x='x'
            y='y'
            scale-x='width / 282'
            scale-y='width / 282'
          />
        </Particle>
        <MyNote column={1} file={noteWhite} />
        <MyNote column={2} file={noteBlue} />
        <MyNote column={3} file={noteWhite} />
        <MyNote column={4} file={noteGreen} />
        <MyNote column={5} file={noteWhite} />
        <MyNote column={6} file={noteBlue} />
        <MyNote column={7} file={noteWhite} />
      </Group>
      <Group x='498'>
        <PressStart />
        <HopeGauge />
        <Group y='400'>
          <Judgments />
        </Group>
        <Group y='440'>
          <JudgmentDeviations />
        </Group>
      </Group>
      <Tutorial width={1280} />
    </Skin>
  )
}
