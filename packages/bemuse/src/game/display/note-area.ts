import type { GameEvent, GameNote } from '@mikuroxina/bemuse-notechart'
import sortBy from 'lodash/sortBy'

export interface VisibleNote {
  note: GameNote
  y: number
  height?: number
}

export interface VisibleBarLine {
  id: number
  y: number
}

export class NoteArea {
  constructor(notes: readonly GameNote[], barLines: readonly GameEvent[]) {
    this._notes = sortBy(notes, position)
    this._barLines = barLines.map(position).sort((a, b) => a - b)
  }

  private _notes: GameNote[]
  private _barLines: number[]

  getVisibleNotes(lower: number, upper: number, headroom = 0): VisibleNote[] {
    const out = []
    for (const note of this._notes) {
      const visible = note.end
        ? !(note.position > upper || note.end.position < lower - headroom)
        : !(note.position > upper || note.position < lower - headroom)
      if (visible) {
        const entity: VisibleNote = {
          note: note,
          y: y(lower, upper, note.position),
        }
        if (note.end) {
          const head = y(lower, upper, note.position)
          const tail = y(lower, upper, note.end.position)
          entity.y = Math.min(head, tail)
          entity.height = Math.abs(head - tail)
        }
        out.push(entity)
      }
    }
    return out
  }

  getVisibleBarLines(
    lower: number,
    upper: number,
    headroom = 0
  ): VisibleBarLine[] {
    return this._barLines
      .filter((pos) => lower - headroom <= pos && pos <= upper)
      .map((pos) => ({ id: pos, y: y(lower, upper, pos) }))
  }
}

export default NoteArea

function y(lower: number, upper: number, pos: number) {
  return 1 - (pos - lower) / (upper - lower)
}

function position(event: GameEvent) {
  return event.position
}
