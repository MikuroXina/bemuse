import { Button } from '@ui5/webcomponents-react/Button'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Option } from '@ui5/webcomponents-react/Option'
import { Select } from '@ui5/webcomponents-react/Select'
import { useReducer } from 'react'

import { RenoteEditor } from '~/components/renoter/renote-editor'
import { openChart, openDir, searchBmsFiles } from '~/lib/renoter/open'
import { previewSound } from '~/lib/renoter/preview-sound'
import { initialState, reducer } from '~/lib/renoter/reducer'
import { save } from '~/lib/renoter/save'
import type { RenoteData } from '~/lib/renoter/types'

export default function Renoter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  function onClickOpenDir() {
    openDir(dispatch)
  }
  function onClickCloseDir() {
    dispatch(['CLOSE_DIR', []])
  }
  function onClickOpenChart(fileName: string) {
    if (state.type === 'OPEN_DIR') {
      openChart(state.directoryHandle, fileName, dispatch)
    }
  }
  async function onClickCloseChart() {
    if (state.type === 'OPEN_CHART') {
      const bmsFileNames = await searchBmsFiles(state.directoryHandle)
      dispatch(['CLOSE_CHART', bmsFileNames])
    }
  }
  function onPreviewSound(sound?: string) {
    if (state.type === 'OPEN_CHART' && sound !== undefined) {
      previewSound(state.directoryHandle, sound)
    }
  }
  function onSave(detail: Pick<RenoteData, 'newNotes' | 'groups'>) {
    if (state.type === 'OPEN_CHART') {
      save({
        ...state,
        chartFileName: state.chartHandle.name,
        detail,
      })
    }
  }

  if (state.type === 'CLOSED') {
    return (
      <Button design='Emphasized' onClick={onClickOpenDir}>
        Choose a song folder
      </Button>
    )
  }
  if (state.type === 'LOADING') {
    return (
      <div style={{ padding: '1rem' }}>
        <MessageStrip design='Information'>Checking...</MessageStrip>
      </div>
    )
  }
  if (state.type === 'ERROR') {
    return (
      <>
        <Button design='Emphasized' onClick={onClickOpenDir}>
          Choose a song folder
        </Button>
        <div style={{ padding: '1rem' }}>
          <MessageStrip design='Negative'>{state.message}</MessageStrip>
        </div>
      </>
    )
  }
  if (state.type === 'OPEN_DIR') {
    return (
      <>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const choice = (
              e.target.elements.namedItem('chart') as HTMLSelectElement
            ).value
            onClickOpenChart(choice)
          }}
        >
          <Select name='chart'>
            {state.bmsFileNames.map((chart) => (
              <Option key={chart}>{chart}</Option>
            ))}
          </Select>
          <Button type='Submit'>Open chart</Button>
        </form>
        <Button design='Negative' onClick={onClickCloseDir}>
          Close folder
        </Button>
      </>
    )
  }
  return (
    <RenoteEditor
      data={state.renoteData}
      chart={state.chart}
      previewSound={onPreviewSound}
      save={onSave}
      close={onClickCloseChart}
    />
  )
}
