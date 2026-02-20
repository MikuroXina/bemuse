import query from '@bemuse/utils/query.js'

let flagSet: Set<string> | undefined

/**
 * The `?flags` parameter allows enabling experimental features by specifying a comma-separated list of flags.
 */
export function isQueryFlagEnabled(flagName: string) {
  if (!flagSet) {
    flagSet = new Set(
      String(query.flags || '')
        .split(',')
        .filter(Boolean)
    )
  }
  return flagSet.has(flagName)
}

export function isTitleDisplayMode() {
  return query.BEMUSE_TITLE_DISPLAY === '1'
}

export function shouldShowAbout() {
  return query.BEMUSE_SHOW_ABOUT === '1'
}

export function shouldShowModeSelect() {
  return query.BEMUSE_SHOW_MODE_SELECT === '1'
}

export function shouldShowOptions() {
  return query.BEMUSE_SHOW_OPTIONS === '1'
}

export function shouldDisableFullScreen() {
  return query.BEMUSE_NO_FULLSCREEN === '1'
}
