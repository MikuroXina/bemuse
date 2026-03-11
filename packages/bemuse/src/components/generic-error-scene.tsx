import ModalPopup from '@bemuse/components/common/modal-popup.js'
import Panel from '@bemuse/components/common/panel.js'
import Scene from '@bemuse/components/common/scene.js'
import { useMemo } from 'react'

import styles from './generic-error-scene.module.scss'
import OptionsButton from './options/options-button.js'

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
            <div className={styles.primaryActionRow}>
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
