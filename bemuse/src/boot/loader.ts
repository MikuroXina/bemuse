export interface Module {
  main: (callbacks: { setStatus: (status: string) => void }) => Promise<void>
}

// This file holds the logic to generate a code-splitting loader function.
// The code is compiled on build-time.
const modules = {
  // >> boot/modes
  // app
  //   The main game application. This will bring up the Title Screen.
  app: () => import('@bemuse/app/index.js'),

  // >>
  // music
  //   The music collection viewer which shows all the songs.
  music: () => import('@bemuse/music-collection-viewer/index.js'),

  // >>
  // comingSoon
  //   Displays the "coming soon" text.
  comingSoon: () => import('@bemuse/coming-soon/index.js'),

  // >>
  // sync
  //   Displays a simple UI for determining your computer's audio+input
  //   latency.
  sync: () => import('@bemuse/auto-synchro/index.js'),

  // >>
  // game
  //   Runs the game shell.
  game: () => import('@bemuse/game/index.js'),

  // >>
  // playground
  //   Various playgrounds...
  playground: () => import('@bemuse/devtools/playground.js'),

  // >>
  // previewer
  //   Runs BMS previewer.
  previewer: () => import('@bemuse/previewer/index.js'),
} as const satisfies Record<string, () => Promise<Module>>

export default modules
