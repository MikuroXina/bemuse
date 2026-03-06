import '@ui5/webcomponents-icons/activities.js'
import '@ui5/webcomponents-icons/alert.js'
import '@ui5/webcomponents-icons/attachment-audio.js'
import '@ui5/webcomponents-icons/attachment-video.js'
import '@ui5/webcomponents-icons/full-stacked-column-chart.js'
import '@ui5/webcomponents-icons/information.js'
import '@ui5/webcomponents-icons/media-play.js'
import '@ui5/webcomponents-icons/message-success.js'
import '@ui5/webcomponents-icons/synchronize.js'
import '@ui5/webcomponents-fiori/illustrations/NoData.js'

import type { Chart } from '@mikuroxina/bemuse-types'
import { Bar } from '@ui5/webcomponents-react/Bar'
import { BusyIndicator } from '@ui5/webcomponents-react/BusyIndicator'
import { Button } from '@ui5/webcomponents-react/Button'
import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { IllustratedMessage } from '@ui5/webcomponents-react/IllustratedMessage'
import { Input, type InputDomRef } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { List } from '@ui5/webcomponents-react/List'
import { ListItemStandard } from '@ui5/webcomponents-react/ListItemStandard'
import { Option } from '@ui5/webcomponents-react/Option'
import { Select, type SelectDomRef } from '@ui5/webcomponents-react/Select'
import { ShellBar } from '@ui5/webcomponents-react/ShellBar'
import { Tab } from '@ui5/webcomponents-react/Tab'
import { TabContainer } from '@ui5/webcomponents-react/TabContainer'
import { Table } from '@ui5/webcomponents-react/Table'
import { TableCell } from '@ui5/webcomponents-react/TableCell'
import { TableHeaderCell } from '@ui5/webcomponents-react/TableHeaderCell'
import { TableHeaderRow } from '@ui5/webcomponents-react/TableHeaderRow'
import { TableRow } from '@ui5/webcomponents-react/TableRow'
import { useReducer, useRef } from 'react'

import { ImagePreview } from '~/components/image-preview'
import { MetadataEditor } from '~/components/metadata-editor'
import { VideoSynchronizer } from '~/components/video-synchronizer'
import { choose } from '~/lib/song/choose'
import { convertAudioFiles } from '~/lib/song/convert-audio-files'
import { createPreview } from '~/lib/song/create-preview'
import { indexCharts } from '~/lib/song/index-charts'
import { initialState, reducer } from '~/lib/song/reducer'
import { renderSong } from '~/lib/song/render'
import { saveMetadata } from '~/lib/song/save-metadata'
import { getMetadataStatus } from '~/lib/song-file'
import type { SoundAssetsMetadata } from '~/lib/types'

function formatSize(bytes: number) {
  return (bytes / 1048576).toFixed(2) + ' MB'
}

function totalSize(soundAssets: SoundAssetsMetadata) {
  return soundAssets.refs.reduce((acc, ref) => {
    return acc + ref.size
  }, 0)
}

function ChartExtra({ chart: _chart }: { chart: Chart }) {
  return null
}

export default function Song() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const chartSelector = useRef<SelectDomRef | null>(null)
  const previewStartTimeInput = useRef<InputDomRef | null>(null)

  const {
    usingDir,
    soundAssets,
    songMeta,
    songOgg,
    previewMp3,
    readme,
    extractProgress: choosingProgress,
    convertProgress,
    indexProgress,
    renderProgress,
    createPreviewProgress,
    scanVisualFilesProgress: scanningVisualFilesProgress,
  } = state
  const metadataStatus = getMetadataStatus(songMeta)
  const previewCreated = !!previewMp3
  const checkItems = [
    {
      label: 'Optimize sound assets',
      description:
        'Sound assets should be optimized for smaller size and faster delivery.',
      ok: !!soundAssets,
      infoText: soundAssets
        ? `Already optimized — ${formatSize(totalSize(soundAssets))}`
        : 'No sound assets found',
    },
    {
      label: 'Scan chart files',
      description:
        'Scan the chart files to update the available charts in the song.',
      ok: songMeta?.charts.length ?? 0 > 0,
      infoText: songMeta?.charts.length + ' chart files found',
    },
    {
      label: 'Song preview',
      description: 'Create a 30-second preview of the song.',
      ok: previewCreated,
      infoText: previewCreated
        ? 'Preview already created'
        : 'No preview file found',
    },
    {
      label: 'Song metadata',
      description: 'Set up song metadata.',
      ok: metadataStatus.ok,
      infoText: metadataStatus.infoText,
    },
  ]

  async function scanVisualFiles() {}
  async function setVideoOffset() {}
  async function close() {}
  async function recheck() {}

  if (!usingDir) {
    return (
      <IllustratedMessage
        name='NoData'
        titleText='Please choose a song folder to get started'
        subtitleText='Required Chromium-based browsers to open your folder'
      >
        <Button design='Emphasized' onClick={() => choose(dispatch)}>
          Choose a song folder
        </Button>
      </IllustratedMessage>
    )
  }
  if (choosingProgress[0] === 'processing') {
    return (
      <main>
        <ShellBar id='shellbar' primaryTitle='Bemuse Custom Song Workshop' />
        <div style={{ textAlign: 'center', padding: '1rem;' }}>
          <BusyIndicator size='L' />
        </div>
      </main>
    )
  }
  return (
    <>
      <Bar design='Subheader'>
        <Label>{usingDir.name}</Label>
        <Button
          icon='synchronize'
          title='Refresh'
          slot='endContent'
          onClick={recheck}
        ></Button>
      </Bar>
      <TabContainer className='full-width'>
        <Tab text='Overview' selected icon='activities'>
          <List className='full-width'>
            {checkItems.map((item) => (
              <ListItemStandard
                key={item.label}
                icon={item.ok ? 'message-success' : 'alert'}
                description={item.description || '…'}
                additionalText={item.infoText || ''}
                additionalTextState={item.ok ? 'Positive' : 'Negative'}
              >
                {item.label}
              </ListItemStandard>
            ))}
          </List>
        </Tab>

        <Tab
          text='Sound assets'
          icon='attachment-audio'
          style={{ padding: '1rem' }}
        >
          {soundAssets ? (
            <Card>
              <CardHeader slot='header' titleText='Sound assets' />
              <div style={{ padding: '1rem' }}>
                Sound assets found. To regenerate, delete the
                “bemuse-data/sound” folder.
              </div>
              <Table>
                <TableHeaderRow slot='headerRow'>
                  <TableHeaderCell> Name </TableHeaderCell>
                  <TableHeaderCell> Size </TableHeaderCell>
                </TableHeaderRow>
                {soundAssets.refs.map((ref) => (
                  <TableRow key={ref.path} rowKey={ref.path}>
                    <TableCell>{ref.path}</TableCell>
                    <TableCell>{(ref.size / 1048576).toFixed(2)} MB</TableCell>
                  </TableRow>
                ))}
              </Table>
            </Card>
          ) : (
            <Card>
              <CardHeader slot='header' titleText='Optimize sound assets' />
              <div style={{ padding: '1rem' }}>
                <Button
                  onClick={() => convertAudioFiles(usingDir, dispatch)}
                  disabled={convertProgress[0] === 'processing'}
                >
                  Optimize sound assets
                </Button>
                <div>
                  <Label>{convertProgress[1]}</Label>
                </div>
              </div>
            </Card>
          )}
        </Tab>

        <Tab
          text='Charts'
          icon='full-stacked-column-chart'
          style={{ padding: '1rem' }}
        >
          <Card>
            <CardHeader
              slot='header'
              titleText='Charts'
              subtitleText={indexProgress[1]}
            >
              <Button
                slot='action'
                onClick={() => indexCharts(usingDir, dispatch)}
                disabled={indexProgress[0] === 'processing'}
              >
                Scan charts
              </Button>
            </CardHeader>

            <Table noDataText='No Data'>
              <TableHeaderRow slot='headerRow'>
                <TableHeaderCell>Filename</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Artist</TableHeaderCell>
                <TableHeaderCell>Genre</TableHeaderCell>
                <TableHeaderCell>Level</TableHeaderCell>
                <TableHeaderCell>Difficulty</TableHeaderCell>
              </TableHeaderRow>
              {songMeta?.charts.map((chart) => (
                <TableRow key={chart.md5} rowKey={chart.md5}>
                  <TableCell>
                    {chart.file}
                    <small style={{ display: 'block' }}>
                      <ChartExtra chart={chart} />
                    </small>
                  </TableCell>
                  <TableCell>
                    {chart.info.title}
                    {chart.info.subtitles.map((t) => (
                      <small key={t} style={{ display: 'block' }}>
                        {t}
                      </small>
                    ))}
                  </TableCell>
                  <TableCell>
                    {chart.info.artist}
                    {chart.info.subartists.map((t) => (
                      <small key={t} style={{ display: 'block' }}>
                        {t}
                      </small>
                    ))}
                  </TableCell>
                  <TableCell>{chart.info.genre}</TableCell>
                  <TableCell>{chart.info.level}</TableCell>
                  <TableCell>{chart.info.difficulty}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        </Tab>

        <Tab text='Preview' icon='media-play' style={{ padding: '1rem' }}>
          <Card>
            <CardHeader slot='header' titleText='Render song'></CardHeader>
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              {(songMeta?.charts.length ?? 0 > 0) && soundAssets ? (
                <>
                  <Select ref={chartSelector}>
                    {songMeta?.charts.map((chart) => (
                      <Option key={chart.md5} data-chart={chart.file}>
                        {chart.file}
                      </Option>
                    ))}
                  </Select>
                  <Button
                    onClick={() => {
                      const file =
                        chartSelector?.current?.selectedOption?.dataset['chart']
                      if (file) {
                        renderSong(usingDir, soundAssets, file, dispatch)
                      }
                    }}
                    disabled={renderProgress[0] === 'processing'}
                  >
                    Render song
                  </Button>
                  <Label>{renderProgress[1]}</Label>
                </>
              ) : (
                <Label>
                  Please optimize sound assets and scan charts first.
                </Label>
              )}
            </div>
            {songMeta?.replaygain && songOgg && (
              <div
                style={{
                  padding: '0 1rem 1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <audio controls src={songOgg}></audio>
                <Label>ReplayGain: {songMeta.replaygain}</Label>
              </div>
            )}
          </Card>
          {songMeta?.replaygain && songOgg && (
            <Card style={{ marginTop: '1rem' }}>
              <CardHeader slot='header' titleText='Create song preview' />
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <Input
                  placeholder='Start time in seconds'
                  ref={previewStartTimeInput}
                  value={songMeta?.preview_start?.toString() ?? ''}
                ></Input>
                <Button
                  onClick={() => {
                    const startTime = parseFloat(
                      previewStartTimeInput?.current?.value ?? '0'
                    )
                    createPreview(usingDir, startTime, dispatch)
                  }}
                  disabled={createPreviewProgress[0] === 'processing'}
                >
                  Create song preview
                </Button>
                <Label>{createPreviewProgress[1]}</Label>
              </div>
              {previewMp3 && (
                <div
                  style={{
                    padding: '0 1rem 1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <audio controls src={previewMp3}></audio>
                </div>
              )}
            </Card>
          )}
        </Tab>

        <Tab text='Metadata' icon='information' style={{ padding: '1rem' }}>
          {songMeta ? (
            <MetadataEditor
              songMeta={songMeta}
              onSave={(updater, readmeContents) =>
                saveMetadata(usingDir, updater, readmeContents)
              }
              readme={readme}
            />
          ) : (
            <Label> Please scan charts first. </Label>
          )}
        </Tab>

        <Tab text='Visuals' icon='attachment-video' style={{ padding: '1rem' }}>
          <Card>
            <CardHeader slot='header' titleText='Scan image and BGA files' />
            <div style={{ padding: '1rem' }}>
              <Button
                onClick={scanVisualFiles}
                disabled={scanningVisualFilesProgress[0] === 'processing'}
              >
                Scan
              </Button>
            </div>
            <div style={{ padding: '0 1rem 1rem' }}>
              Expecting files in these locations:
              <ul>
                <li>bemuse-data/back_image.(jpg/png)</li>
                <li>bemuse-data/eyecatch_image.(jpg/png)</li>
                <li>bemuse-data/bga.(webm/mp4)</li>
              </ul>
            </div>
          </Card>

          {songMeta && usingDir && typeof usingDir === 'object' && (
            <div
              style={{
                display: 'flex',
                marginTop: '1rem',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ width: '50%', flex: '1' }}>
                <Card>
                  <CardHeader slot='header' titleText='Eyecatch image' />
                  <ImagePreview
                    directoryHandle={usingDir}
                    path={songMeta.eyecatch_image_url}
                  />
                </Card>
                <Card style={{ marginTop: '1rem' }}>
                  <CardHeader slot='header' titleText='Background image' />
                  <ImagePreview
                    directoryHandle={usingDir}
                    path={songMeta.back_image_url}
                  />
                </Card>
              </div>
              <div style={{ width: '50%', flex: '1' }}>
                <Card>
                  <CardHeader slot='header' titleText='BGA' />
                  <div style={{ padding: '1rem' }}>
                    {songMeta.video_url ? (
                      songOgg ? (
                        <VideoSynchronizer
                          directoryHandle={usingDir}
                          videoPath={songMeta.video_url}
                          videoOffset={Number(songMeta.video_offset)}
                          setVideoOffset={setVideoOffset}
                          songOgg={songOgg}
                        />
                      ) : (
                        'Please render the song in "Preview" tab first.'
                      )
                    ) : (
                      <>
                        No BGA file. Please add a BGA file at the expected
                        locations and rescan.
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Tab>
      </TabContainer>
      <Bar design='Footer'>
        <Label slot='startContent'>Current folder: {usingDir.name}</Label>
        <Button design='Negative' slot='endContent' onClick={close}>
          Close folder
        </Button>
      </Bar>
    </>
  )
}
