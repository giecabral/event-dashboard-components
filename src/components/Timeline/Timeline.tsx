import { useMemo, useRef, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { useAnnouncer } from '../../hooks/useAnnouncer'
import { TimelineGroup, type DayGroup } from './TimelineGroup'
import type { Event } from '../../data/mockEvents'

interface TimelineProps {
  events: Event[]
}

interface FocusPos {
  g: number  // group index
  i: number  // item index, -1 = group header
}

export function Timeline({ events }: TimelineProps) {
  const announce = useAnnouncer()

  // Group events by date (YYYY-MM-DD), sorted chronologically.
  // Day is the natural grouping because events have an explicit date field
  // and users expect to scan "what's happening on a given day".
  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, Event[]>()
    for (const event of events) {
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
  }, [events])

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

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">No events to display.</p>
    )
  }

  return (
    <div
      role="tree"
      aria-label="Events timeline grouped by day"
      onKeyDown={handleKeyDown}
      className="max-h-fit overflow-y-auto pr-2"
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
          // Only the currently focused element gets tabIndex=0 (roving tabindex pattern).
          // This keeps the timeline as a single Tab stop while arrow keys navigate internally.
          headerTabIndex={
            focusPos.current.g === gIdx && focusPos.current.i === -1 ? 0 : -1
          }
          itemTabIndex={(iIdx) =>
            focusPos.current.g === gIdx && focusPos.current.i === iIdx ? 0 : -1
          }
          onHeaderFocus={() => { focusPos.current = { g: gIdx, i: -1 } }}
          onItemFocus={(iIdx) => { focusPos.current = { g: gIdx, i: iIdx } }}
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
  )
}
