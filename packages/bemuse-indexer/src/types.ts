import type {
  Chart as OutputChart,
  ChartBga as BGAInfo,
  ChartBpm as BPMInfo,
  SongMetadata,
} from 'bemuse-types'

export type Keys = 'empty' | '14K' | '10K' | '7K' | '5K'

export interface IndexingInputFile {
  name: string
  data: Buffer
}

export type { BGAInfo, BPMInfo, OutputChart }

export type OutputFileInfo = Omit<OutputChart, 'file'>

export type OutputSongInfoVideo = Pick<
  SongMetadata,
  'video_file' | 'video_offset'
>

export type OutputSongInfo = Pick<
  SongMetadata,
  | 'title'
  | 'artist'
  | 'genre'
  | 'bpm'
  | 'charts'
  | 'warnings'
  | 'video_file'
  | 'video_offset'
>
