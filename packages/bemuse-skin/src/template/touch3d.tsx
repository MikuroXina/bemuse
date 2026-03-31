import {
  Animation,
  Group,
  Keyframe,
  Object,
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
      <Sprite image={`Touch3DMode/Highlight${column}.png`} blend='screen'>
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
      <Object key={`p1_note3d_${column}`} pool='24'>
        <Sprite
          image={file}
          x='x'
          y='y'
          anchor-x='0.5'
          anchor-y='1'
          scale-x='width / 26.5'
          scale-y='width / 28'
        />
      </Object>
      <Group x={`${560 * (((column - 0.5) / 7) * 2 - 1) + 1280 / 2}`} y='689'>
        <Animation>
          <Keyframe t='0' alpha='0' scale-x='2' scale-y='2' />
        </Animation>
        <Animation on={`p1_${column}_explode`}>
          <Keyframe t='0' alpha='1' scale-x='4' scale-y='2' />
          <Keyframe t='0.18' alpha='0' scale-x='4' scale-y='4' />
        </Animation>
        <Sprite
          image='Explosion/NoteExplosion.png'
          x='-25'
          y='-25'
          blend='screen'
        />
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
        <Sprite image='InfoPanel/Background.png' />
        <Sprite image='InfoPanel/Template.png' y='1' />
        <Text
          x='176'
          y='22'
          text='%s'
          data='p1_score'
          font-family='ScoreNumber'
          font-src='Fonts/ScoreNumber.fnt'
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
          y='22'
          text='%s'
          data='p1_speed'
          font-family='ScoreNumber'
          font-src='Fonts/ScoreNumber.fnt'
          align='left'
        />
        <Text
          x='1099'
          y='34'
          text='%s'
          data='p1_bpm'
          font-family='StatNumber'
          font-src='Fonts/StatNumber.fnt'
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
      </Group>
      <Group>
        <Animation>
          <Keyframe t='0.25' alpha='0' />
          <Keyframe t='0.6' alpha='1' ease='quadOut' />
        </Animation>
        <Sprite image='Touch3DMode/Lane.png' x='0' y='0' />
        <Sprite
          image='Touch3DMode/Flash.png'
          x='0'
          y='0'
          blend='screen'
          alpha='1 - p1_beat % 1'
        />
        <Object key='p1_barlines3d' pool='24'>
          <Sprite
            image='NoteArea/Bar.png'
            x='x'
            y='y'
            scale-x='width / 282'
            scale-y='width / 282'
          />
        </Object>
        <MyNote column={1} file='Touch3DMode/NoteWhite.png' />
        <MyNote column={2} file='Touch3DMode/NoteBlue.png' />
        <MyNote column={3} file='Touch3DMode/NoteWhite.png' />
        <MyNote column={4} file='Touch3DMode/NoteGreen.png' />
        <MyNote column={5} file='Touch3DMode/NoteWhite.png' />
        <MyNote column={6} file='Touch3DMode/NoteBlue.png' />
        <MyNote column={7} file='Touch3DMode/NoteWhite.png' />
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
