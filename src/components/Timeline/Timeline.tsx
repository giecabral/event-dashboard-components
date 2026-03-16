import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { useTimelineNavigation } from '../../hooks/useTimelineNavigation'
import { TimelineGroup, type DayGroup } from './TimelineGroup'
import type { Event } from '../../data/mockEvents'

interface TimelineProps {
  events: Event[]
  isLoading?: boolean
  onItemClick?: (event: Event) => void
  className?: string
}

// Skeleton group layout mirrors the real TimelineGroup/TimelineItem structure
const SKELETON_GROUPS = [3, 2, 3]

export function Timeline({ events, isLoading = false, onItemClick, className }: TimelineProps) {
  // Group events by date (YYYY-MM-DD), sorted chronologically.
  // Date filtering is handled upstream (App-level) so both grid and timeline stay in sync.
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

  const { handleKeyDown, onContainerFocus, getGroupProps } = useTimelineNavigation(groups)

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
          tabIndex={0}
          onFocus={onContainerFocus}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-0 overflow-y-auto pr-2 focus:outline-none"
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
              onItemClick={onItemClick}
              {...getGroupProps(gIdx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
