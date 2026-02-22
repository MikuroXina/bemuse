import './GenericErrorScene.scss'

import ModalPopup from '@bemuse/ui/ModalPopup.js'
import Panel from '@bemuse/ui/Panel.js'
import Scene from '@bemuse/ui/Scene.js'
import { useMemo } from 'react'

import * as Analytics from '../app/analytics.js'
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
    <Scene className='GenericErrorScene'>
      <ModalPopup>
        <Panel title='Error'>
          <div className='GenericErrorSceneのwrapper'>
            <textarea
              className='GenericErrorSceneのstack'
              value={details}
              readOnly
            />

            <div style={{ textAlign: 'right' }}>
              <OptionsButton
                onClick={() => {
                  Analytics.send('error', 'continue', String(error))
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
