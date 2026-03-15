import { useMemo, useRef, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { useAnnouncer } from '../../hooks/useAnnouncer'
import { TimelineGroup, type DayGroup } from './TimelineGroup'
import type { Event } from '../../data/mockEvents'

interface TimelineProps {
  events: Event[]
  isLoading?: boolean
  onItemClick?: (event: Event) => void
  className?: string
}

interface FocusPos {
  g: number  // group index
  i: number  // item index, -1 = group header
}

// Skeleton group layout mirrors the real TimelineGroup/TimelineItem structure
const SKELETON_GROUPS = [3, 2, 3]

export function Timeline({ events, isLoading = false, onItemClick, className }: TimelineProps) {
  const announce = useAnnouncer()

  // Group events by date (YYYY-MM-DD), sorted chronologically.
  // Date filtering is handled upstream (App-level) so both the grid and timeline stay in sync.
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
  //   Left / Right  — move between days (same item position within day)
  //   Down          — move to next item in day (or first item if on header)
  //   Up            — move to previous item (or day header if on first item)
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

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${className ?? ''}`}>
      {isLoading ? (
        <div className="flex-1 overflow-y-auto pr-2 animate-pulse" aria-hidden="true">
          {SKELETON_GROUPS.map((cardCount, groupIdx) => (
            <div key={groupIdx}>
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-white py-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-40 rounded bg-gray-200" />
              </div>
              <div className="relative mt-2 mb-5 flex flex-col gap-2.5 border-l-2 border-gray-200 pl-2">
                {Array.from({ length: cardCount }).map((_, cardIdx) => (
                  <div key={cardIdx} className="ml-6 rounded-lg border border-gray-200 bg-white p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                    </div>
                    <div className="mt-2 flex gap-3">
                      <div className="h-3 w-10 rounded bg-gray-200" />
                      <div className="h-3 w-24 rounded bg-gray-200" />
                    </div>
                    <div className="mt-2">
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">No events to display.</p>
      ) : (
        <div
          role="tree"
          aria-label="Events timeline grouped by day"
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-0 overflow-y-auto pr-2"
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
