import type { BMSObject } from '@mikuroxina/bms'
import { useEffect } from 'react'

import { PX_PER_BEAT, type RenoterLayout } from './layout'
import type { ObjectRow } from './types'

export interface RenoterRowProps {
  row: ObjectRow
  layout: RenoterLayout
  selected: boolean
  selectedColumnIndex: number
  newNotes: Record<
    string,
    {
      value: string
      length?: number
    }
  >
  setlength: (params: {
    row: ObjectRow
    channel: string
    length: number
  }) => void
  notemouseenter?: (object: BMSObject) => void
  notemouseleave?: (object: BMSObject) => void
}

export const RenoterRow = ({
  row,
  layout,
  selected,
  selectedColumnIndex,
  newNotes,
  setlength,
  notemouseenter,
  notemouseleave,
}: RenoterRowProps) => {
  const notedObjects = Object.entries(newNotes || []).flatMap(
    ([channel, info]) => {
      const matchingObject = row.objects.find((o) => o.value === info.value)
      if (!matchingObject) {
        return []
      }
      return [
        {
          channel,
          object: matchingObject,
          length: info.length || 0,
        },
      ]
    }
  )

  let dragging:
    | {
        startY: number
        startLength: number
        channel: string
      }
    | undefined

  function onMouseDown(
    e: MouseEvent,
    channel: string,
    object: BMSObject,
    startLength: number
  ) {
    if (e.button !== 0) {
      return
    }
    dragging = {
      startY: e.clientY,
      startLength,
      channel,
    }
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) {
      return
    }
    const delta = e.clientY - dragging.startY
    const newLength = Math.max(
      0,
      dragging.startLength - Math.round((delta / PX_PER_BEAT) * 4) * (240 / 4)
    )
    setlength({
      row,
      channel: dragging.channel,
      length: newLength,
    })
    e.preventDefault()
  }
  function onMouseUp(e: MouseEvent) {
    if (!dragging) {
      return
    }
    dragging = undefined
    e.preventDefault()
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className='row' class:is-selected={selected}>
      <div className='line'></div>
      <div className='objectRow-text'>{row.timeKey.split(':')[1]}</div>
      {notedObjects.map(({ object, channel, length }) => (
        <div
          className='obj'
          key={channel}
          data-channel={channel}
          style={{
            transform: `translateX(${layout.getNoteX(channel)}px)`,
            '--group-color': layout.getGroupColor(layout.getGroupIndex(object)),
          }}
          onMouseDown={(e) => onMouseDown(e, channel, object, length)}
          onMouseEnter={() => notemouseenter?.(object)}
          onMouseLeave={() => notemouseleave?.(object)}
        >
          {object.value}

          {length > 0 && (
            <div
              className='ln'
              style={{ '--ln-length': `${(length * PX_PER_BEAT) / 240}px` }}
            >
              {object.value}
            </div>
          )}
        </div>
      ))}
      {row.objects.map((object, i) => (
        <div
          className='obj'
          key={i}
          class:is-selectable={
            layout.getGroupIndex(object) === selectedColumnIndex
          }
          style={{
            transform: `translateX(${layout.getX(row, object)}px)`,
            '--group-color': layout.getGroupColor(layout.getGroupIndex(object)),
          }}
          onMouseEnter={() => notemouseenter?.(object)}
          onMouseLeave={() => notemouseleave?.(object)}
        >
          {object.value}
        </div>
      ))}
    </div>
  )
}
