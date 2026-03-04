<script lang="ts">
  import type { SongMetadata } from "@mikuroxina/bemuse-types";
  import Markdown from "./Markdown.svelte";
  import { validateSong } from "./SongFile";

  interface Props {
    onSave: (
      updater: (song: SongMetadata) => SongMetadata,
      readmeContents: string,
    ) => void;
    songJson: any;
    readme: string;
  }

  const { onSave, songJson, readme }: Props = $props();

  const valueOf = (id: string) => (document.getElementById(id) as any).value;

  function save() {
    const readmeContents = valueOf("song_description").trim();
    onSave((newJson) => {
      newJson.title = valueOf("song_title");
      newJson.artist = valueOf("song_artist");
      newJson.genre = valueOf("song_genre");
      newJson.song_url = valueOf("song_url") || undefined;
      newJson.bms_url = valueOf("bms_url") || undefined;
      newJson.youtube_url = valueOf("youtube_url") || undefined;
      newJson.long_url = valueOf("long_url") || undefined;
      newJson.bmssearch_id = valueOf("bmssearch_id") || undefined;
      newJson.artist_url = valueOf("artist_url") || undefined;
      newJson.added = valueOf("added_date") || undefined;
      newJson.readme = readmeContents ? "README.md" : "";
      return newJson;
    }, readmeContents);
  }

  const songGenre = $derived(songJson.genre);
  const songTitle = $derived(songJson.title);
  const songUrl = $derived(songJson.song_url || "");
  const bmsUrl = $derived(songJson.bms_url || "");
  const youtubeUrl = $derived(songJson.youtube_url || "");
  const longUrl = $derived(songJson.long_url || "");
  const songArtist = $derived(songJson.artist);
  const songArtistUrl = $derived(songJson.artist_url || "");
  const addedDate = $derived(songJson.added || "");
  const bmssearchId = $derived(songJson.bmssearch_id || "");

  const warnings = $derived(validateSong(songJson));
</script>

<div style="display: flex; gap: 2rem">
  <div style="flex: 50% 1 1">
    <ui5-card>
      <ui5-card-header slot="header" title-text="Edit song metadata"
      ></ui5-card-header>
      <div style="padding: 1rem;">
        <form>
          <p>
            <ui5-label for="song_genre">Song genre</ui5-label><br />
            <ui5-input id="song_genre" value={songGenre}></ui5-input>
          </p>
          <p>
            <ui5-label for="song_title">Song title</ui5-label><br />
            <ui5-input id="song_title" value={songTitle}></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="song_url">Song URL</ui5-label><br />
            <ui5-input
              id="song_url"
              style="width: 32em"
              value={songUrl}
              placeholder="e.g. SoundCloud"
            ></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="bms_url">BMS download URL</ui5-label><br />
            <ui5-input
              id="bms_url"
              style="width: 32em"
              value={bmsUrl}
              placeholder="e.g. event venue entry page"
            ></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="youtube_url">YouTube URL</ui5-label><br />
            <ui5-input
              id="youtube_url"
              style="width: 32em"
              value={youtubeUrl}
              placeholder=""
            ></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="long_url">Long version URL</ui5-label><br />
            <ui5-input
              id="long_url"
              style="width: 32em"
              value={longUrl}
              placeholder="e.g. SoundCloud for extended version of this song"
            ></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="bmssearch_id">BMS Search ID</ui5-label><br />
            <ui5-input id="bmssearch_id" style="width: 8em" value={bmssearchId}
            ></ui5-input>
          </p>
          <p>
            <ui5-label for="song_artist">Song artist</ui5-label><br />
            <ui5-input id="song_artist" value={songArtist}></ui5-input>
          </p>
          <p class="indent">
            <ui5-label for="artist_url">Artist URL</ui5-label><br />
            <ui5-input
              id="artist_url"
              style="width: 32em"
              value={songArtistUrl}
              placeholder="e.g. website, SoundCloud, Twitter"
            ></ui5-input>
          </p>
          <p>
            <ui5-label for="added_date">Released</ui5-label><br />
            <ui5-date-picker
              id="added_date"
              format-pattern="yyyy-MM-dd"
              value={addedDate}
            ></ui5-date-picker>
          </p>
          <p>
            <ui5-label for="song_description">Song description</ui5-label><br />
            <ui5-textarea
              id="song_description"
              placeholder="Description"
              growing
              growing-max-lines="10"
              value={readme}
            ></ui5-textarea>
          </p>
        </form>
        <div style="text-align:right">
          <ui5-button onclick={save}> Save song metadata </ui5-button>
        </div>
      </div>
    </ui5-card>
  </div>
  <div style="flex: 50% 1 1">
    <ui5-card>
      <ui5-card-header slot="header" title-text="Metadata checklist"
      ></ui5-card-header>
      <div style="padding: 1rem;">
        {#if warnings.length > 0}
          <ul>
            {#each warnings as warning}
              <li>{warning.message}</li>
            {/each}
          </ul>
        {:else}
          No warnings
        {/if}
      </div>
    </ui5-card>
    <ui5-card style="margin-top: 1rem">
      <ui5-card-header slot="header" title-text="Song description"
      ></ui5-card-header>
      <div style="padding: 1rem;">
        {#if readme}
          <Markdown source={readme} />
        {:else}
          <em>No description given</em>
        {/if}
      </div>
    </ui5-card>
  </div>
</div>

<style>
  .indent {
    margin-left: 2rem;
  }
</style>
