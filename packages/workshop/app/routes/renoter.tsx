import { Button } from '@ui5/webcomponents-react/Button'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { useReducer } from 'react'

import { RenoteEditor } from '~/components/renoter/renote-editor'
import { open } from '~/lib/renoter/open'
import { previewSound } from '~/lib/renoter/preview-sound'
import { initialState, reducer } from '~/lib/renoter/reducer'
import { save } from '~/lib/renoter/save'
import type { RenoteData } from '~/lib/renoter/types'

export interface RenoterProps {
  renoteSource: string
}

export default function Renoter({ renoteSource }: RenoterProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  function onClickOpen() {
    open(renoteSource, dispatch)
  }
  function onPreviewSound(sound?: string) {
    if (state.type === 'OPEN' && sound !== undefined) {
      previewSound(state.directoryHandle, sound)
    }
  }
  function onSave(detail: Pick<RenoteData, 'newNotes' | 'groups'>) {
    if (state.type === 'OPEN') {
      save({
        ...state,
        renoteSource,
        detail,
      })
    }
  }

  if (state.type === 'CLOSED') {
    return (
      <Button design='Emphasized' onClick={onClickOpen}>
        Choose a song folder
      </Button>
    )
  }
  if (state.type === 'LOADING') {
    return (
      <div style={{ padding: '1rem;' }}>
        <MessageStrip design='Information'>Checking...</MessageStrip>
      </div>
    )
  }
  if (state.type === 'ERROR') {
    return (
      <>
        <Button design='Emphasized' onClick={onClickOpen}>
          Choose a song folder
        </Button>
        <div style={{ padding: '1rem;' }}>
          <MessageStrip design='Negative'>{state.message}</MessageStrip>
        </div>
      </>
    )
  }
  return (
    <RenoteEditor
      data={state.data}
      chart={state.chart}
      previewSound={onPreviewSound}
      save={onSave}
    />
  )
}
