import { Card } from "@ui5/webcomponents-react/Card";
import styles from "./metadata-editor.module.css";
import { CardHeader } from "@ui5/webcomponents-react/CardHeader";
import { Label } from "@ui5/webcomponents-react/Label";
import { Input } from "@ui5/webcomponents-react/Input";
import type { SongMetadata } from "@mikuroxina/bemuse-types";
import { TextArea } from "@ui5/webcomponents-react/TextArea";
import { DatePicker } from "@ui5/webcomponents-react/DatePicker";
import { Button } from "@ui5/webcomponents-react/Button";
import { Markdown } from "./markdown";

export interface MetadataEditorProps {
  songMeta: SongMetadata;
  onSave: () => void;
  readme: string;
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
}: MetadataEditorProps) => (
  <div style={{ display: "flex; gap: 2rem" }}>
    <div style={{ flex: "50% 1 1" }}>
      <Card>
        <CardHeader slot="header" titleText="Edit song metadata" />
        <div style={{ padding: "1rem" }}>
          <form>
            <p>
              <Label for="song_genre">Song genre</Label>
              <br />
              <Input id="song_genre" value={songGenre} />
            </p>
            <p>
              <Label for="song_title">Song title</Label>
              <br />
              <Input id="song_title" value={songTitle} />
            </p>
            <p className={styles.indent}>
              <Label for="song_url">Song URL</Label>
              <br />
              <Input
                id="song_url"
                style={{ width: "32em" }}
                value={songUrl}
                placeholder="e.g. SoundCloud"
              />
            </p>
            <p className={styles.indent}>
              <Label for="bms_url">BMS download URL</Label>
              <br />
              <Input
                id="bms_url"
                style={{ width: "32em" }}
                value={bmsUrl}
                placeholder="e.g. event venue entry page"
              />
            </p>
            <p className={styles.indent}>
              <Label for="youtube_url">YouTube URL</Label>
              <br />
              <Input
                id="youtube_url"
                style={{ width: "32em" }}
                value={youtubeUrl}
                placeholder=""
              />
            </p>
            <p className={styles.indent}>
              <Label for="long_url">Long version URL</Label>
              <br />
              <Input
                id="long_url"
                style={{ width: "32em" }}
                value={longUrl}
                placeholder="e.g. SoundCloud for extended version of this song"
              />
            </p>
            <p className={styles.indent}>
              <Label for="bmssearch_id">BMS Search ID</Label>
              <br />
              <Input
                id="bmssearch_id"
                style={{ width: "8em" }}
                value={(bmssearchId ?? "").toString()}
              />
            </p>
            <p>
              <Label for="song_artist">Song artist</Label>
              <br />
              <Input id="song_artist" value={songArtist} />
            </p>
            <p className={styles.indent}>
              <Label for="artist_url">Artist URL</Label>
              <br />
              <Input
                id="artist_url"
                style={{ width: "32em" }}
                value={songArtistUrl}
                placeholder="e.g. website, SoundCloud, Twitter"
              />
            </p>
            <p>
              <Label for="added_date">Released</Label>
              <br />
              <DatePicker
                id="added_date"
                format-pattern="yyyy-MM-dd"
                value={addedDate}
              />
            </p>
            <p>
              <Label for="song_description">Song description</Label>
              <br />
              <TextArea
                id="song_description"
                placeholder="Description"
                growing
                growing-max-lines="10"
                value={readme}
              />
            </p>
          </form>
          <div style={{ textAlign: "right" }}>
            <Button onClick={onSave}> Save song metadata </Button>
          </div>
        </div>
      </Card>
    </div>
    <div style={{ flex: "50% 1 1" }}>
      <Card>
        <CardHeader slot="header" titleText="Metadata checklist" />
        <div style={{ padding: "1rem" }}>
          {warnings && warnings.length > 0 ? (
            <ul>
              {warnings.map((warning) =>
                typeof warning === "object" &&
                warning != null &&
                "message" in warning ? (
                  <li>{`${warning.message}`}</li>
                ) : null,
              )}
            </ul>
          ) : (
            "No warnings"
          )}
        </div>
      </Card>
      <Card style={{ marginTop: "1rem" }}>
        <CardHeader slot="header" titleText="Song description" />
        <div style={{ padding: "1rem" }}>
          {readme ? (
            <Markdown source={readme} />
          ) : (
            <em>No description given</em>
          )}
        </div>
      </Card>
    </div>
  </div>
);
