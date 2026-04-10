export function formatTime(seconds: number): string {
  const s = Math.floor(seconds % 60)
  return Math.floor(seconds / 60) + ':' + (s < 10 ? '0' : '') + s
}

export default formatTime
