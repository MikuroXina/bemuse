import { Button } from '@ui5/webcomponents-react/Button'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'

import { RenoteEditor } from '~/components/renoter/renote-editor'

export default function Renoter() {
  const handle = null
  const errorMessage = null
  const state = null

  function check() {}
  function onPreviewSound() {}
  function onSave() {}

  if (!handle) {
    return (
      <Button design='Emphasized' onClick={check}>
        Choose a song folder
      </Button>
    )
  }

  if (errorMessage) {
    return (
      <div style={{ padding: '1rem;' }}>
        <MessageStrip design='Negative'>{state.message}</MessageStrip>
      </div>
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
