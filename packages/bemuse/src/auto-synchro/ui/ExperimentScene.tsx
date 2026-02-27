import { type Subject, useSubject } from '@bemuse/utils/subject.js'
import type { MouseEventHandler } from 'react'

import styles from './ExperimentScene.module.scss'

export type ExperimentState =
  | {
      type: 'loading'
    }
  | { type: 'ready' }
  | {
      type: 'started'
    }
  | {
      type: 'listening'
      numSamples: number
    }
  | {
      type: 'finished'
      numSamples: number
      latency: number
    }

const initialState = {
  type: 'loading',
} as const

export interface ExperimentSceneProps {
  stateSubject: Subject<ExperimentState>
  onStart?: MouseEventHandler<HTMLButtonElement>
}

const ExperimentScene = (props: ExperimentSceneProps) => {
  const state = useSubject(props.stateSubject, initialState)
  return (
    <div className={styles.scene} data-type={state.type}>
      <div className={styles.wrapper}>
        <div className={styles.wrapperInner}>
          <Contents state={state} onStart={props.onStart} />
        </div>
      </div>
    </div>
  )
}

export default ExperimentScene

const Ready = ({
  onStart,
}: {
  onStart?: MouseEventHandler<HTMLButtonElement>
}) => (
  <div>
    <button className={styles.button} onClick={onStart}>
      Start Calibration
    </button>
  </div>
)

const Message = ({ text }: { text: string }) => (
  <div className={styles.message}>{text}</div>
)

const Contents = ({
  state,
  onStart,
}: Pick<ExperimentSceneProps, 'onStart'> & { state: ExperimentState }) => {
  if (state.type === 'loading') {
    return null
  }
  if (state.type === 'ready') {
    return <Ready onStart={onStart} />
  }
  if (state.type === 'started') {
    return <Message text='Please listen to the beats…' />
  }

  const finished = state.type === 'finished'
  const scale = finished ? 1 : easeOut(Math.min(1, state.numSamples / 84))
  const transform = `scaleX(${scale})`
  const style = {
    transform: transform,
    WebkitTransform: transform,
  }
  return (
    <div>
      <Message
        text={
          finished
            ? `Your latency is ${state.latency}ms. Please close this window.`
            : 'Please press the space bar when you hear the kick drum.'
        }
      />
      <div className={styles.progress}>
        <div className={styles.progressBar} style={style} />
      </div>
    </div>
  )
}

function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 2)
}
