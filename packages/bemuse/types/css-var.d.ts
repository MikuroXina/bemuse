// https://stackoverflow.com/a/70398145/9067735
import 'react'

declare module 'react' {
  interface CSSProperties {
    // Allow any CSS variable starting with '--'
    [key: `--${string}`]: string | number
  }
}
