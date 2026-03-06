import { Bar } from '@ui5/webcomponents-react/Bar'
import { Button } from '@ui5/webcomponents-react/Button'
import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Label } from '@ui5/webcomponents-react/Label'
import { Table } from '@ui5/webcomponents-react/Table'
import { TableCell } from '@ui5/webcomponents-react/TableCell'
import { TableHeaderCell } from '@ui5/webcomponents-react/TableHeaderCell'
import { TableHeaderRow } from '@ui5/webcomponents-react/TableHeaderRow'
import { TableRow } from '@ui5/webcomponents-react/TableRow'
import { TableSelectionMulti } from '@ui5/webcomponents-react/TableSelectionMulti'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { type SubmitEvent, useReducer } from 'react'

import { addUrls } from '~/lib/server/add-urls'
import { chooseServerFile } from '~/lib/server/choose'
import { newServerFile } from '~/lib/server/new-file'
import { initialState, reducer, type Status } from '~/lib/server/reducer'
import { scanSongs } from '~/lib/server/scan-songs'

interface StatusProps {
  text: string
  status: string
}

function statusProps(status: Status): StatusProps {
  if (status === 'scanning') {
    return {
      text: 'Scanning...',
      status: 'Information',
    }
  }
  if (status === 'skipped') {
    return {
      text: 'Skipped',
      status: 'Success',
    }
  }
  if (status === 'error') {
    return {
      text: 'Error',
      status: 'Error',
    }
  }
  if (status === 'completed') {
    return {
      text: 'Completed',
      status: 'Success',
    }
  }
  return { text: '', status: 'None' }
}

export default function Server() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { serverFile, data, scanStatus } = state

  function onSubmitAddUrls(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (serverFile) {
      addUrls(
        (e.target.elements.namedItem('urls') as HTMLTextAreaElement).value,
        serverFile,
        data
      )
    }
  }
  function closeServer() {}

  if (!serverFile) {
    return (
      <IllustratedMessage
        name='NoData'
        title-text='No server file selected'
        subtitle-text='Open or create a server file'
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            design='Emphasized'
            onClick={() => chooseServerFile(dispatch)}
          >
            Open a server file
          </Button>
          <Button design='Emphasized' onClick={() => newServerFile(dispatch)}>
            Create a new server file
          </Button>
        </div>
      </IllustratedMessage>
    )
  }

  return (
    <>
      <Bar design='Subheader'>
        <Label>{serverFile.name}</Label>
      </Bar>

      <div
        style={{
          display: 'grid',
          padding: '1rem',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(480px,100%),1fr))',
        }}
      >
        <Card>
          <CardHeader slot='header' title-text='URLs'>
            <Button
              slot='action'
              onClick={() => scanSongs(serverFile, data, dispatch)}
            >
              Update data
            </Button>
          </CardHeader>
          <div style={{ overflow: 'auto', maxHeight: '64vh' }}>
            <Table no-data-text='No URLs.' sticky-column-header='true'>
              <TableSelectionMulti slot='features' />
              <TableHeaderRow slot='headerRow'>
                <TableHeaderCell>URL</TableHeaderCell>
                <TableHeaderCell>Added</TableHeaderCell>
                <TableHeaderCell style={{ width: '12rem' }}>
                  Status
                </TableHeaderCell>
              </TableHeaderRow>
              {data.urls.map((entry) => (
                <TableRow key={entry.url} data-entry-url={entry.url}>
                  <TableCell>{entry.url}</TableCell>
                  <TableCell>
                    {entry.added ? entry.added : '(from metadata)'}
                  </TableCell>
                  <TableCell>
                    <span
                      data-status={statusProps(scanStatus[entry.url]).status}
                      className='url-status-text'
                    >
                      {statusProps(scanStatus[entry.url]).text}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
          <form onSubmit={onSubmitAddUrls} style={{ padding: '1rem' }}>
            <strong>Add URL</strong>
            <div>
              <TextArea
                placeholder='Enter URLs (one per line)'
                name='urls'
              ></TextArea>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button design='Emphasized' type='Submit'>
                {' '}
                Add{' '}
              </Button>
            </div>
          </form>
        </Card>
        <Card>
          <CardHeader slot='header' title-text='Songs'></CardHeader>
          <Table className='demo-table' id='table'>
            <TableHeaderRow slot='headerRow'>
              <TableHeaderCell> Added </TableHeaderCell>
              <TableHeaderCell> Genre </TableHeaderCell>
              <TableHeaderCell> Title </TableHeaderCell>
              <TableHeaderCell> Artist </TableHeaderCell>
            </TableHeaderRow>
            {data.songs.map((song) => (
              <TableRow key={song.id} rowKey={song.id}>
                <TableCell>
                  {song.initial
                    ? '(initial)'
                    : (song.added && song.added.slice(0, 10)) ||
                      'MISSING ADDED DATE'}
                </TableCell>
                <TableCell>{song.genre}</TableCell>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.artist}</TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      </div>

      <Bar design='Footer'>
        <Label slot='startContent'>Current file: {serverFile.name}</Label>
        <Button design='Negative' slot='endContent' onClick={closeServer}>
          Close folder
        </Button>
      </Bar>

      <style>{`
        .url-status-text[data-status='Information'] {
          color: var(--sapInformationColor);
        }
        .url-status-text[data-status='Error'] {
          color: var(--sapErrorColor);
        }
        .url-status-text[data-status='Warning'] {
          color: var(--sapWarningColor);
        }
        .url-status-text[data-status='Success'] {
          color: var(--sapSuccessColor);
        }
      `}</style>
    </>
  )
}
