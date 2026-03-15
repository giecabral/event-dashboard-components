import { forwardRef } from 'react'
import { MapPinIcon, ClockIcon, PencilSquareIcon } from '@heroicons/react/20/solid'
import { CATEGORY_STYLES, CATEGORY_DOT_DEFAULT, STATUS_STYLES } from '../../lib/categoryColors'
import type { Event } from '../../data/mockEvents'

interface TimelineItemProps {
  event: Event
  index: number
  groupSize: number
  tabIndex: number
  onFocus: () => void
  onClick?: () => void
}

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ event, index, groupSize, tabIndex, onFocus, onClick }, ref) => {
    const dotColor = CATEGORY_STYLES[event.category]?.dot ?? CATEGORY_DOT_DEFAULT

    return (
      <div
        ref={ref}
        role="treeitem"
        tabIndex={tabIndex}
        onFocus={onFocus}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
        aria-posinset={index + 1}
        aria-setsize={groupSize}
        aria-label={`${event.title}, ${event.status}, ${event.time}, ${event.location}`}
        className="group relative ml-6 rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm transition-shadow focus:outline-none focus:ring-1 focus:ring-gray-800 focus:ring-offset-1 hover:shadow-md cursor-pointer"
      >
        <span
          className={`absolute -left-[1.6rem] top-4 h-3 w-3 rounded-full border-2 border-white ${dotColor}`}
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug text-gray-900">{event.title}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <PencilSquareIcon className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${STATUS_STYLES[event.status] ?? ''}`}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[120px]">{event.location}</span>
          </span>
        </div>

        <div className="mt-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[event.category]?.badge ?? 'text-gray-600 bg-gray-50 ring-gray-200'}`}>
            {event.category}
          </span>
        </div>
      </div>
    )
  }
)

TimelineItem.displayName = 'TimelineItem'
