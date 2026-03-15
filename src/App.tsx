import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { DataGrid } from './components/DataGrid'
import { Timeline } from './components/Timeline'
import { EventForm } from './components/EventForm'
import { useEventStore } from './store/events'
import type { DataGridColumn } from './components/DataGrid'
import type { EventFormData } from './components/EventForm'
import type { Event } from './data/mockEvents'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip'

const columns: DataGridColumn[] = [
  { accessorKey: 'title', header: 'Title', enableSorting: true, enableColumnFilter: true, size: 180 },
  { accessorKey: 'date', header: 'Date', enableSorting: true, enableColumnFilter: false, size: 96 },
  { accessorKey: 'time', header: 'Time', enableSorting: false, enableColumnFilter: false, size: 72 },
  { accessorKey: 'category', header: 'Category', enableSorting: true, enableColumnFilter: true, size: 100 },
  { accessorKey: 'status', header: 'Status', enableSorting: true, enableColumnFilter: true, size: 96 },
  { accessorKey: 'location', header: 'Location', enableSorting: false, enableColumnFilter: true, size: 140 },
  { accessorKey: 'attendees', header: 'Attendees', enableSorting: true, enableColumnFilter: false, size: 80 },
  { accessorKey: 'organizer', header: 'Organizer', enableSorting: true, enableColumnFilter: true, size: 120 },
]

export default function App() {
  const { events, isLoading, error, addEvent, updateEvent } = useEventStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  function handleEdit(event: Event) {
    setEditingEvent(event)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditingEvent(null)
  }

  function handleSave(data: EventFormData) {
    if (editingEvent) {
      updateEvent(editingEvent.id, { ...data, description: data.description ?? '' })
    } else {
      addEvent({ ...data, description: data.description ?? '' })
    }
  }

  return (
    <div className="flex min-h-screen lg:h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Event Dashboard
            </h1>
            <p className="hidden text-sm text-gray-500 sm:block">
              Manage and organize your events
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-default-blue px-3 py-2 text-sm font-medium text-white focus:outline-none"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Event</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row gap-5 px-4 py-5 lg:px-8 lg:py-6 lg:overflow-hidden">
        <section aria-labelledby="grid-heading" className="lg:flex-1 lg:min-w-0">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:h-full lg:flex lg:flex-col">
            <h2 id="grid-heading" className="mb-4 text-base font-semibold text-gray-900">
              All Events
            </h2>
            <div className="lg:flex-1 lg:min-h-0">
              <DataGrid
                data={events}
                columns={columns}
                isLoading={isLoading}
                error={error}
                pageSize={15}
                onRowClick={handleEdit}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="timeline-heading"
          className="lg:w-[340px] lg:shrink-0"
        >
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:h-full lg:overflow-y-auto">
            <h2 id="timeline-heading" className="flex gap-2 mb-4 text-base font-semibold text-gray-900">
              Timeline
              <Tooltip>
                <TooltipTrigger>
                  <InformationCircleIcon className='h-4 w-4 text-gray-400' />
                </TooltipTrigger>
                <TooltipContent className="max-w-60 bg-gray-400 text-white" side={"right"} sideOffset={8}>
                  Use the arrow keys to navigate the schedule. Left and Right move between days. Up and Down move between events within the current day.
                </TooltipContent>
              </Tooltip>
            </h2>
            <Timeline events={events} onItemClick={handleEdit} />
          </div>
        </section>


      </main>

      <EventForm
        open={formOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialData={editingEvent ?? undefined}
      />
    </div>
  )
}
