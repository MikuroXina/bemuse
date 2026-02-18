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
  music: () => import('@bemuse/music-collection-viewer'),

  // >>
  // test
  //   The unit tests.
  test: () => import('@bemuse/test'),

  // >>
  // comingSoon
  //   Displays the "coming soon" text.
  comingSoon: () => import('@bemuse/coming-soon'),

  // >>
  // sync
  //   Displays a simple UI for determining your computer's audio+input
  //   latency.
  sync: () => import('@bemuse/auto-synchro'),

  // >>
  // game
  //   Runs the game shell.
  game: () => import('@bemuse/game'),

  // >>
  // playground
  //   Various playgrounds...
  playground: () => import('@bemuse/devtools/playground'),

  // >>
  // previewer
  //   Runs BMS previewer.
  previewer: () => import('@bemuse/previewer'),
}

export default modules
