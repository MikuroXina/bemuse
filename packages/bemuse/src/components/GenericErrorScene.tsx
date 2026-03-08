import ModalPopup from '@bemuse/components/common/ModalPopup.js'
import Panel from '@bemuse/components/common/Panel.js'
import Scene from '@bemuse/components/common/Scene.js'
import { useMemo } from 'react'

import styles from './GenericErrorScene.module.scss'
import OptionsButton from './options/OptionsButton.js'

export default function GenericErrorScene(props: {
  preamble: string
  error: Error
  onContinue: () => void
}) {
  const { preamble, error, onContinue } = props
  const details = useMemo(() => {
    return [
      preamble,
      '',
      '[Error]',
      String(error),
      '',
      '[User agent]',
      navigator.userAgent,
      '',
      '[Stack trace]',
      String((error && error.stack) || error),
    ].join('\n')
  }, [error, preamble])
  return (
    <Scene className={styles.scene}>
      <ModalPopup>
        <Panel title='Error'>
          <div className={styles.wrapper}>
            <textarea className={styles.stack} value={details} readOnly />

            <div style={{ textAlign: 'right' }}>
              <OptionsButton
                onClick={() => {
                  onContinue()
                }}
              >
                Continue
              </OptionsButton>
            </div>
          </div>
        </Panel>
      </ModalPopup>
    </Scene>
  )
}
