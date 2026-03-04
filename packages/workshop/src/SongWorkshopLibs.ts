declare namespace SongWorkshopLibsNamespace {
  export const bms: typeof import("bms");
  export const indexer: typeof import("bemuse-indexer");
  export const notechart: typeof import("bemuse-notechart");
  export const notechartLoader: typeof import("bemuse-notechart/lib/loader");
  export const buffer: typeof import("buffer");
}

export const SongWorkshopLibs: typeof SongWorkshopLibsNamespace = (
  window as any
).SongWorkshopLibs;

export type SongWorkshopLibs = typeof SongWorkshopLibsNamespace;
