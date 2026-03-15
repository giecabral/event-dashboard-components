import { useMemo, useRef, useCallback, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useAnnouncer } from '../../hooks/useAnnouncer'
import { TimelineGroup, type DayGroup } from './TimelineGroup'
import type { Event } from '../../data/mockEvents'

interface TimelineProps {
  events: Event[]
  onItemClick?: (event: Event) => void
  className?: string
}

interface FocusPos {
  g: number  // group index
  i: number  // item index, -1 = group header
}

export function Timeline({ events, onItemClick, className }: TimelineProps) {
  const announce = useAnnouncer()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Group events by date (YYYY-MM-DD), sorted chronologically,
  // filtered by the selected date range when set.
  const groups = useMemo<DayGroup[]>(() => {
    const filtered = events.filter((e) => {
      if (fromDate && e.date < fromDate) return false
      if (toDate && e.date > toDate) return false
      return true
    })
    const map = new Map<string, Event[]>()
    for (const event of filtered) {
      const bucket = map.get(event.date) ?? []
      map.set(event.date, [...bucket, event])
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, evts]) => ({
        date,
        label: format(parseISO(date), 'EEEE, MMMM d, yyyy'),
        events: evts,
      }))
  }, [events, fromDate, toDate])

  // Roving tabindex: tracks which cell currently owns tabIndex=0
  const focusPos = useRef<FocusPos>({ g: 0, i: -1 })

  // 2D ref maps: headers[g] and items[g][i]
  const headerRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const itemRefs   = useRef<Map<string, HTMLDivElement>>(new Map())

  const itemKey = (g: number, i: number) => `${g}-${i}`

  // Move focus to (g, i), clamping to valid bounds, and announce to screen readers
  const focusAt = useCallback(
    (g: number, i: number) => {
      const clampedG = Math.max(0, Math.min(g, groups.length - 1))
      const group = groups[clampedG]
      if (!group) return

      const clampedI = Math.max(-1, Math.min(i, group.events.length - 1))
      focusPos.current = { g: clampedG, i: clampedI }

      if (clampedI === -1) {
        headerRefs.current.get(clampedG)?.focus()
        announce(
          `Group ${clampedG + 1} of ${groups.length}: ${group.label}, ${group.events.length} event${group.events.length !== 1 ? 's' : ''}`
        )
      } else {
        itemRefs.current.get(itemKey(clampedG, clampedI))?.focus()
        const ev = group.events[clampedI]
        announce(
          `${ev.title}. ${ev.status}. ${ev.time}, ${ev.location}. Item ${clampedI + 1} of ${group.events.length}`
        )
      }
    },
    [groups, announce]
  )

  // Keyboard nav:
  //   Left / Right  — move between groups (same item position within group)
  //   Down          — move to next item in group (or first item if on header)
  //   Up            — move to previous item (or group header if on first item)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { g, i } = focusPos.current
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          focusAt(g + 1, i)
          break
        case 'ArrowLeft':
          e.preventDefault()
          focusAt(g - 1, i)
          break
        case 'ArrowDown':
          e.preventDefault()
          focusAt(g, i + 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          focusAt(g, i - 1)
          break
      }
    },
    [focusAt]
  )

  const inputBase = 'w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs shadow-sm focus:outline-none'

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${className ?? ''}`}>
      {/* Date range filter */}
      <div className="mb-3 flex items-center gap-1">
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-xs text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={toDate || undefined}
            className={inputBase}
          />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-xs text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate || undefined}
            className={inputBase}
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate('') }}
            className="self-end mb-px rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 focus:outline-none"
          >
            Clear
          </button>
        )}
      </div>

      {/* Scrollable groups list */}
      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">No events to display.</p>
      ) : (
        <div
          role="tree"
          aria-label="Events timeline grouped by day"
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-0 max-h-[880px] overflow-y-auto pr-2"
        >
          <p className="sr-only">
            Use arrow keys to navigate. Left and Right move between day groups.
            Up and Down move between events within a group.
          </p>

          {groups.map((group, gIdx) => (
            <TimelineGroup
              key={group.date}
              group={group}
              groupIndex={gIdx}
              totalGroups={groups.length}
              headerTabIndex={
                focusPos.current.g === gIdx && focusPos.current.i === -1 ? 0 : -1
              }
              itemTabIndex={(iIdx) =>
                focusPos.current.g === gIdx && focusPos.current.i === iIdx ? 0 : -1
              }
              onHeaderFocus={() => { focusPos.current = { g: gIdx, i: -1 } }}
              onItemFocus={(iIdx) => { focusPos.current = { g: gIdx, i: iIdx } }}
              onItemClick={onItemClick}
              headerRef={(el) => {
                if (el) headerRefs.current.set(gIdx, el)
                else headerRefs.current.delete(gIdx)
              }}
              itemRef={(iIdx, el) => {
                const key = itemKey(gIdx, iIdx)
                if (el) itemRefs.current.set(key, el)
                else itemRefs.current.delete(key)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
