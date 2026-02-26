import OptionsButton from '@bemuse/components/options/OptionsButton.js'
import {
  type ReactScene,
  SceneManagerContext,
} from '@bemuse/scene-manager/index.js'
import Scene from '@bemuse/ui/Scene.js'
import { useContext } from 'react'

import { SUPPORTED } from '../browser-support.js'
import styles from './BrowserSupportWarningScene.module.scss'

const BrowserSupportWarningScene = ({
  next,
}: {
  next: ReactScene | JSX.Element
}) => {
  const sceneManager = useContext(SceneManagerContext)

  const handleContinue = () => {
    sceneManager.display(next)
  }

  return (
    <Scene className={styles.scene}>
      <h1>Warning: Unsupported Browser</h1>
      <p>
        It seems that you are using an unsupported browser.
        <br />
        This game may not work correctly.
      </p>
      <p>
        We support
        {SUPPORTED.map((browser, index, array) => [
          separator(index, array.length),
          <strong key={browser.name}>{browser.name}</strong>,
        ])}
        .
      </p>
      <p>
        <OptionsButton onClick={handleContinue}>Continue Anyway</OptionsButton>
      </p>
      <p className={styles.userAgent}>
        <strong>User agent:</strong> {navigator.userAgent}
      </p>
    </Scene>
  )
}

const separator = (index: number, length: number): string => {
  if (index === 0) {
    return ' '
  }
  if (index === length - 1) {
    return ' and '
  }
  return ', '
}

export default BrowserSupportWarningScene
