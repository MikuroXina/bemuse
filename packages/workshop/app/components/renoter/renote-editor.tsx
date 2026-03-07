import { type BMSChart, type BMSObject, Keysounds } from '@mikuroxina/bms'
import { MessageStrip } from '@ui5/webcomponents-react/MessageStrip'
import { Tree } from '@ui5/webcomponents-react/Tree'
import { TreeItem } from '@ui5/webcomponents-react/TreeItem'
import memoize from 'lodash/memoize'
import sortedIndexBy from 'lodash/sortedIndexBy'
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  Channel,
  NotesMapEntry,
  ObjectRow,
  RenoteData,
  TimeKey,
} from '../../lib/renoter/types'
import { calculateLayout, PX_PER_BEAT } from './layout'
import { RenoterRow } from './row'

export interface RenoteEditorProps {
  previewSound: (sound?: string) => void
  save: (detail: Pick<RenoteData, 'newNotes' | 'groups'>) => void
  chart: BMSChart
  data: RenoteData
}

const VIEWPORT_PADDING_PX = 192
const BOTTOM_PX = 32

export const RenoteEditor = ({
  previewSound,
  save,
  chart,
  data,
}: RenoteEditorProps) => {
  const newNotes = data.newNotes ?? {}
  const groups = data.groups ?? []

  const [info, setInfo] = useState('Hover to see sound file')
  const [selectedTimeKey, setSelectedTimeKey] = useState<TimeKey>('0:0')
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  const [viewport, setViewport] = useState<[number, number]>([0, 0])
  const scroller = useRef<HTMLDivElement>(null)

  const toBeat = memoize(
    (measure: number, fraction: number) => {
      return chart.timeSignatures.measureToBeat(measure, fraction)
    },
    (measure: number, fraction: number) => `${measure}-${fraction}`
  )

  const maxMeasure =
    chart.objects.all().reduce((a, o) => Math.max(a, o.measure), 0) + 1
  const maxTime = chart.objects
    .all()
    .reduce((a, o) => Math.max(a, toBeat(o.measure, o.fraction)), 0)
  const canvasHeight = maxTime * PX_PER_BEAT + VIEWPORT_PADDING_PX
  const keysounds = Keysounds.fromBMSChart(chart)
  const measureLines = [...new Array(maxMeasure)].map((_, i) => ({
    number: i,
    y: getY(toBeat(i, 0)),
  }))
  const objectRows = groupObjectsByY(chart.objects.allSorted())
  const layout = calculateLayout(objectRows, groups, keysounds)
  const visibleObjectRows = filterVisible(viewport, objectRows)

  const totalNotes = useMemo(
    () =>
      Object.values(newNotes).reduce(
        (a, x) => a + Object.keys(x as Record<Channel, unknown>).length,
        0
      ),
    [newNotes]
  )

  function onScroll() {
    if (scroller.current) {
      setViewport([
        scroller.current.scrollTop,
        scroller.current.scrollTop + scroller.current.clientHeight,
      ])
    }
  }

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = canvasHeight
    }
    onScroll()
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function getY(beat: number) {
    return canvasHeight - BOTTOM_PX - beat * PX_PER_BEAT
  }
  function groupObjectsByY(objects: BMSObject[]) {
    const rows: ObjectRow[] = []
    const map: Record<number, ObjectRow> = {}
    for (const o of objects) {
      if (o.channel !== '01' && !('11' <= o.channel && o.channel <= '59')) {
        continue
      }
      const y = getY(toBeat(o.measure, o.fraction))
      const beatsThisMeasure = chart.timeSignatures.getBeats(o.measure)
      let row = map[y]
      if (!row) {
        row = {
          y,
          objects: [],
          timeKey: `${o.measure}:${Math.round(o.fraction * 960 * (beatsThisMeasure / 4))}`,
        }
        rows.push(row)
        map[y] = row
      }
      row.objects.push(o)
    }
    rows.sort((a, b) => a.y - b.y)
    for (const row of rows) {
      row.objects.sort((a, b) => (a.value < b.value ? -1 : 1))
    }
    return rows
  }
  function filterVisible<T extends { y: number }>(
    range: typeof viewport,
    things: T[]
  ): T[] {
    return things.filter((t) => t.y >= range[0] && t.y <= range[1])
  }

  function onNoteHover(e: BMSObject) {
    const keysound = keysounds.get(e.value)
    setInfo(`${e.value}: ${keysound}`)
    previewSound(keysound)
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = scroller.current?.getBoundingClientRect()
    if (rect && scroller.current && e.shiftKey) {
      const x = e.clientX - rect.left + scroller.current.scrollLeft
      const y = e.clientY - rect.top + scroller.current.scrollTop
      const rowIndex = sortedIndexBy<{ y: number }>(
        objectRows,
        { y: y },
        (r) => r.y
      )
      if (objectRows[rowIndex]) {
        setSelectedTimeKey(objectRows[rowIndex].timeKey)
      }
      const groupIndex =
        sortedIndexBy<{ x: number }>(
          layout.groupColumns,
          { x: x },
          (c) => c.x
        ) - 1
      if (layout.groupColumns[groupIndex]) {
        setSelectedGroupIndex(groupIndex)
      }
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      console.log('Save!!!')
      save({
        newNotes,
        groups,
      })
      return
    }
    switch (e.key) {
      case 'ArrowLeft': {
        e.preventDefault()
        setSelectedGroupIndex(layout.getPreviousGroupIndex(selectedGroupIndex))
        break
      }
      case 'ArrowRight': {
        e.preventDefault()
        setSelectedGroupIndex(layout.getNextGroupIndex(selectedGroupIndex))
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        goToRow(layout.getRowAbove(selectedTimeKey, selectedGroupIndex))
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        goToRow(layout.getRowBelow(selectedTimeKey, selectedGroupIndex))
        break
      }
      case 'a': {
        e.preventDefault()
        toggleChannel('SC')
        break
      }
      case 'z': {
        e.preventDefault()
        toggleChannel('K1')
        break
      }
      case 's': {
        e.preventDefault()
        toggleChannel('K2')
        break
      }
      case 'x': {
        e.preventDefault()
        toggleChannel('K3')
        break
      }
      case 'd': {
        e.preventDefault()
        toggleChannel('K4')
        break
      }
      case 'c': {
        e.preventDefault()
        toggleChannel('K5')
        break
      }
      case 'f': {
        e.preventDefault()
        toggleChannel('K6')
        break
      }
      case 'v': {
        e.preventDefault()
        toggleChannel('K7')
        break
      }
      default: {
        console.warn('Unhandled key', e.key)
      }
    }
  }
  function toggleChannel(channel: Channel) {
    const row = layout.getRowByTimeKey(selectedTimeKey)
    if (!row) {
      return
    }

    const newNotesOnThisRow = newNotes[row.timeKey] || {}
    const current = newNotesOnThisRow[channel]
    const valuesUsedInOtherChannels = new Set(
      Object.entries(newNotesOnThisRow)
        .filter(([k]) => k !== channel)
        .map(([, v]) => v.value)
    )
    const usableObjects = row.objects
      .filter((o) => layout.getGroupIndex(o) === selectedGroupIndex)
      .filter((o) => !valuesUsedInOtherChannels.has(o.value))
    const nextNewNotesOnThisRow = { ...newNotesOnThisRow }
    if (!current && usableObjects.length) {
      nextNewNotesOnThisRow[channel] = { value: usableObjects[0].value }
    } else if (current) {
      const index = usableObjects.findIndex((o) => o.value === current.value)
      const nextItem = usableObjects[index + 1]
      if (nextItem) {
        nextNewNotesOnThisRow[channel] = { value: nextItem.value }
      } else {
        delete nextNewNotesOnThisRow[channel]
      }
    }
    if (nextNewNotesOnThisRow[channel]) {
      const keysound = keysounds.get(nextNewNotesOnThisRow[channel].value)
      previewSound(keysound)
    }
    newNotes[row.timeKey] = nextNewNotesOnThisRow
  }
  function goToRow(row: ObjectRow | undefined) {
    const scrollerElem = scroller.current
    if (!row || !scrollerElem) {
      return
    }
    const previousY = layout.getRowByTimeKey(selectedTimeKey)?.y
    const nextY = row.y
    if (previousY != null) {
      scrollerElem.scrollTop += nextY - previousY
    }
    if (
      !(
        scrollerElem.scrollTop <= nextY &&
        nextY <= scrollerElem.scrollTop + scrollerElem.clientHeight
      )
    ) {
      scrollerElem.scrollTop = nextY - scrollerElem.clientHeight * 0.75
    }
    setSelectedTimeKey(row.timeKey)
  }
  function onSetLength(e: {
    row: ObjectRow
    channel: Channel
    length: number
  }) {
    const { row, channel, length } = e
    if (newNotes[row.timeKey] && newNotes[row.timeKey]![channel]) {
      newNotes[row.timeKey] = {
        ...newNotes[row.timeKey],
        [channel]: { ...newNotes[row.timeKey]![channel], length },
      }
    }
  }

  return (
    <div
      style={{
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        height: 'calc(100vh - 80px)',
      }}
    >
      <div
        style={{
          flex: '1',
          position: 'relative',
          background: '#000',
          color: '#0f0',
        }}
      >
        <div
          style={{ position: 'absolute', inset: '0', overflow: 'auto' }}
          ref={scroller}
          onScroll={onScroll}
          onMouseMove={onMouseMove}
          onKeyDown={onKeyDown}
          tabIndex={0}
        >
          <div style={{ height: `${canvasHeight}px`, position: 'relative' }}>
            {layout.groupColumns.map(({ x, width }, index) => (
              <div
                className='col'
                key={index}
                data-selected={selectedGroupIndex === index}
                style={{ left: `${x}px`, width: `${width}px` }}
              />
            ))}
            {measureLines.map((measure) => (
              <div
                key={measure.number}
                className='measure'
                style={{ top: `${measure.y}px` }}
              >
                <div className='measure-text'>
                  #{measure.number.toString().padStart(3, '0')}
                </div>
              </div>
            ))}
            {visibleObjectRows.map((row) => (
              <div
                key={row.y}
                className='objectRow'
                style={{ top: `${row.y}px` }}
              >
                <RenoterRow
                  selected={row.timeKey === selectedTimeKey}
                  row={row}
                  layout={layout}
                  selectedColumnIndex={selectedGroupIndex}
                  newNotes={
                    newNotes[row.timeKey] as Record<Channel, NotesMapEntry>
                  }
                  noteMouseEnter={onNoteHover}
                  setLength={onSetLength}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{ flex: 'none', width: '256px', position: 'relative' }}
        className='ui5-content-density-compact'
      >
        <div style={{ position: 'absolute', inset: '0', overflow: 'auto' }}>
          <MessageStrip design='Information' hide-close-button>
            notes: {totalNotes}
          </MessageStrip>
          <MessageStrip design='Information' hide-close-button>
            {info}
          </MessageStrip>
          <Tree selectionMode='Single'>
            {groups.map((group, i) => (
              <TreeItem expanded key={i} text={`Group ${i + 1}`}>
                {group.patterns.map((pattern) => (
                  <TreeItem key={pattern} text={pattern} />
                ))}
              </TreeItem>
            ))}
          </Tree>
          {viewport}
        </div>
      </div>
    </div>
  )
}
