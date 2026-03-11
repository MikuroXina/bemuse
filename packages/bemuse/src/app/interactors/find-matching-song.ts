// Finds a song matching the title

function findMatchingSong<T>({
  songs,
  title,
  getTitle,
}: {
  songs: readonly T[]
  title: string
  getTitle: (song: T) => string
}) {
  return songs.find((song) => titleFullyMatches(getTitle(song), title))
}

function titleFullyMatches(haystack: string, needle: string) {
  return haystack.toLowerCase().trim() === needle.toLowerCase().trim()
}

export default findMatchingSong
