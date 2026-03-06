import type { SongMetadata } from '@mikuroxina/bemuse-types'
import { Button } from '@ui5/webcomponents-react/Button'
import { Card } from '@ui5/webcomponents-react/Card'
import { CardHeader } from '@ui5/webcomponents-react/CardHeader'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import type { SubmitEvent } from 'react'

import { Markdown } from './markdown'
import styles from './metadata-editor.module.css'

export interface MetadataEditorProps {
  songMeta: SongMetadata
  onSave: (
    updater: (song: SongMetadata) => SongMetadata,
    readmeContents: string
  ) => void
  readme: string
}

export const MetadataEditor = ({
  songMeta: {
    genre: songGenre,
    title: songTitle,
    song_url: songUrl,
    bms_url: bmsUrl,
    youtube_url: youtubeUrl,
    long_url: longUrl,
    bmssearch_id: bmssearchId,
    artist: songArtist,
    artist_url: songArtistUrl,
    added: addedDate,
    warnings,
  },
  onSave,
  readme,
}: MetadataEditorProps) => {
  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const elements = event.target.elements
    const readmeContents = (
      elements.namedItem('song_description') as HTMLTextAreaElement
    ).value
    const nonEmptyOpt = (x: string): string | undefined =>
      x === '' ? undefined : x
    onSave(
      (metadata) => ({
        ...metadata,
        title: (elements.namedItem('song_title') as HTMLInputElement).value,
        artist: (elements.namedItem('song_artist') as HTMLInputElement).value,
        genre: (elements.namedItem('song_genre') as HTMLInputElement).value,
        song_url: nonEmptyOpt(
          (elements.namedItem('song_url') as HTMLInputElement).value
        ),
        bms_url: nonEmptyOpt(
          (elements.namedItem('bms_url') as HTMLInputElement).value
        ),
        youtube_url: nonEmptyOpt(
          (elements.namedItem('youtube_url') as HTMLInputElement).value
        ),
        long_url: nonEmptyOpt(
          (elements.namedItem('long_url') as HTMLInputElement).value
        ),
        bmssearch_id: nonEmptyOpt(
          (elements.namedItem('bmssearch_id') as HTMLInputElement).value
        ),
        artist_url: (elements.namedItem('artist_url') as HTMLInputElement)
          .value,
        added: nonEmptyOpt(
          (elements.namedItem('added_date') as HTMLInputElement).value
        ),
        readme: readmeContents === null ? '' : 'README.md',
      }),
      readmeContents ?? ''
    )
  }

  return (
    <div style={{ display: 'flex; gap: 2rem' }}>
      <div style={{ flex: '50% 1 1' }}>
        <Card>
          <CardHeader slot='header' titleText='Edit song metadata' />
          <div style={{ padding: '1rem' }}>
            <form onSubmit={onSubmit}>
              <p>
                <Label for='song_genre'>Song genre</Label>
                <br />
                <Input id='song_genre' value={songGenre} />
              </p>
              <p>
                <Label for='song_title'>Song title</Label>
                <br />
                <Input id='song_title' value={songTitle} />
              </p>
              <p className={styles.indent}>
                <Label for='song_url'>Song URL</Label>
                <br />
                <Input
                  id='song_url'
                  style={{ width: '32em' }}
                  value={songUrl}
                  placeholder='e.g. SoundCloud'
                />
              </p>
              <p className={styles.indent}>
                <Label for='bms_url'>BMS download URL</Label>
                <br />
                <Input
                  id='bms_url'
                  style={{ width: '32em' }}
                  value={bmsUrl}
                  placeholder='e.g. event venue entry page'
                />
              </p>
              <p className={styles.indent}>
                <Label for='youtube_url'>YouTube URL</Label>
                <br />
                <Input
                  id='youtube_url'
                  style={{ width: '32em' }}
                  value={youtubeUrl}
                  placeholder=''
                />
              </p>
              <p className={styles.indent}>
                <Label for='long_url'>Long version URL</Label>
                <br />
                <Input
                  id='long_url'
                  style={{ width: '32em' }}
                  value={longUrl}
                  placeholder='e.g. SoundCloud for extended version of this song'
                />
              </p>
              <p className={styles.indent}>
                <Label for='bmssearch_id'>BMS Search ID</Label>
                <br />
                <Input
                  id='bmssearch_id'
                  style={{ width: '8em' }}
                  value={(bmssearchId ?? '').toString()}
                />
              </p>
              <p>
                <Label for='song_artist'>Song artist</Label>
                <br />
                <Input id='song_artist' value={songArtist} />
              </p>
              <p className={styles.indent}>
                <Label for='artist_url'>Artist URL</Label>
                <br />
                <Input
                  id='artist_url'
                  style={{ width: '32em' }}
                  value={songArtistUrl}
                  placeholder='e.g. website, SoundCloud, Twitter'
                />
              </p>
              <p>
                <Label for='added_date'>Released</Label>
                <br />
                <DatePicker
                  id='added_date'
                  format-pattern='yyyy-MM-dd'
                  value={addedDate}
                />
              </p>
              <p>
                <Label for='song_description'>Song description</Label>
                <br />
                <TextArea
                  id='song_description'
                  placeholder='Description'
                  growing
                  growing-max-lines='10'
                  value={readme}
                />
              </p>
              <div style={{ textAlign: 'right' }}>
                <Button type='Submit'> Save song metadata </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
      <div style={{ flex: '50% 1 1' }}>
        <Card>
          <CardHeader slot='header' titleText='Metadata checklist' />
          <div style={{ padding: '1rem' }}>
            {warnings && warnings.length > 0 ? (
              <ul>
                {warnings.map((warning) =>
                  typeof warning === 'object' &&
                  warning != null &&
                  'message' in warning ? (
                    <li key={`${warning.message}`}>{`${warning.message}`}</li>
                  ) : null
                )}
              </ul>
            ) : (
              'No warnings'
            )}
          </div>
        </Card>
        <Card style={{ marginTop: '1rem' }}>
          <CardHeader slot='header' titleText='Song description' />
          <div style={{ padding: '1rem' }}>
            {readme ? (
              <Markdown source={readme} />
            ) : (
              <em>No description given</em>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
