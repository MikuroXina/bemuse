import type { BMSObject } from '@mikuroxina/bms'
import { type MouseEvent as ReactMouseEvent, useEffect, useRef } from 'react'

import type { Channel, ObjectRow } from '~/lib/renoter/types'

import { PX_PER_BEAT, type RenoterLayout } from './layout'
import styles from './row.module.css'

export interface RenoterRowProps {
  row: ObjectRow
  layout: RenoterLayout
  selected: boolean
  selectedColumnIndex: number
  newNotes: Record<
    Channel,
    {
      value: string
      length?: number
    }
  >
  setLength: (params: {
    row: ObjectRow
    channel: Channel
    length: number
  }) => void
  noteMouseEnter?: (object: BMSObject) => void
  noteMouseLeave?: (object: BMSObject) => void
}

export const RenoterRow = ({
  row,
  layout,
  selected,
  selectedColumnIndex,
  newNotes,
  setLength,
  noteMouseEnter,
  noteMouseLeave,
}: RenoterRowProps) => {
  const notedObjects = Object.entries(newNotes || []).flatMap(
    ([channel, info]) => {
      const matchingObject = row.objects.find((o) => o.value === info.value)
      if (!matchingObject) {
        return []
      }
      return [
        {
          channel: channel as Channel,
          object: matchingObject,
          length: info.length || 0,
        },
      ]
    }
  )

  const dragging = useRef<
    | {
        startY: number
        startLength: number
        channel: Channel
      }
    | undefined
  >(undefined)

  function onMouseDown(
    e: ReactMouseEvent<HTMLDivElement>,
    channel: Channel,
    startLength: number
  ) {
    if (e.button !== 0) {
      return
    }
    dragging.current = {
      startY: e.clientY,
      startLength,
      channel,
    }
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging.current) {
      return
    }
    const delta = e.clientY - dragging.current.startY
    const newLength = Math.max(
      0,
      dragging.current.startLength -
        Math.round((delta / PX_PER_BEAT) * 4) * (240 / 4)
    )
    setLength({
      row,
      channel: dragging.current.channel,
      length: newLength,
    })
    e.preventDefault()
  }
  function onMouseUp(e: MouseEvent) {
    if (!dragging.current) {
      return
    }
    dragging.current = undefined
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
    <div className={styles.row} data-selected={selected}>
      <div className={styles.line}></div>
      <div className={styles.objectRowText}>{row.timeKey.split(':')[1]}</div>
      {notedObjects.map(({ object, channel, length }) => (
        <div
          className={styles.obj}
          key={channel}
          data-channel={channel}
          style={{
            transform: `translateX(${layout.getNoteX(channel)}px)`,
            '--group-color': layout.getGroupColor(layout.getGroupIndex(object)),
          }}
          onMouseDown={(e) => onMouseDown(e, channel, length)}
          onMouseEnter={() => noteMouseEnter?.(object)}
          onMouseLeave={() => noteMouseLeave?.(object)}
        >
          {object.value}

          {length > 0 && (
            <div
              className={styles.ln}
              style={{ '--ln-length': `${(length * PX_PER_BEAT) / 240}px` }}
            >
              {object.value}
            </div>
          )}
        </div>
      ))}
      {row.objects.map((object, i) => (
        <div
          className={styles.obj}
          key={i}
          data-selectable={layout.getGroupIndex(object) === selectedColumnIndex}
          style={{
            transform: `translateX(${layout.getX(row, object)}px)`,
            '--group-color': layout.getGroupColor(layout.getGroupIndex(object)),
          }}
          onMouseEnter={() => noteMouseEnter?.(object)}
          onMouseLeave={() => noteMouseLeave?.(object)}
        >
          {object.value}
        </div>
      ))}
    </div>
  )
}
