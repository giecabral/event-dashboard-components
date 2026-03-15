import { forwardRef } from 'react'
import { CalendarDaysIcon } from '@heroicons/react/20/solid'
import { TimelineItem } from './TimelineItem'
import type { Event } from '../../data/mockEvents'

export interface DayGroup {
  date: string
  label: string
  events: Event[]
}

interface TimelineGroupProps {
  group: DayGroup
  groupIndex: number
  totalGroups: number
  headerTabIndex: number
  itemTabIndex: (itemIndex: number) => number
  onHeaderFocus: () => void
  onItemFocus: (itemIndex: number) => void
  onItemClick?: (event: Event) => void
  headerRef: (el: HTMLDivElement | null) => void
  itemRef: (itemIndex: number, el: HTMLDivElement | null) => void
}

export const TimelineGroup = forwardRef<HTMLDivElement, TimelineGroupProps>(
  (
    {
      group,
      groupIndex,
      totalGroups,
      headerTabIndex,
      itemTabIndex,
      onHeaderFocus,
      onItemFocus,
      onItemClick,
      headerRef,
      itemRef,
    },
    _ref
  ) => (
    <div role="group" aria-label={group.label}>
      <div
        ref={headerRef}
        role="treeitem"
        tabIndex={headerTabIndex}
        onFocus={onHeaderFocus}
        aria-expanded={true}
        aria-posinset={groupIndex + 1}
        aria-setsize={totalGroups}
        aria-label={`${group.label}, ${group.events.length} event${group.events.length !== 1 ? 's' : ''}`}
        className="sticky top-0 z-10 flex items-center gap-2 bg-white py-2 focus:outline-none cursor-default"
      >
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-gray-700">
          {group.label}
        </span>
        <span className="ml-auto text-xs text-gray-800" aria-hidden="true">
          {group.events.length}
        </span>
      </div>

      <div className="relative mt-2 mb-5 flex flex-col gap-2.5 border-l-2 border-gray-200 pl-2">
        {group.events.map((event, i) => (
          <TimelineItem
            key={event.id}
            ref={(el) => itemRef(i, el)}
            event={event}
            index={i}
            groupSize={group.events.length}
            tabIndex={itemTabIndex(i)}
            onFocus={() => onItemFocus(i)}
            onClick={() => onItemClick?.(event)}
          />
        ))}
      </div>
    </div>
  )
)

TimelineGroup.displayName = 'TimelineGroup'
