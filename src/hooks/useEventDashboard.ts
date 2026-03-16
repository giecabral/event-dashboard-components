import { useState, useMemo, useRef } from 'react'
import { useEventStore } from '../store/events'
import type { EventFormData } from '../components/EventForm'
import type { Event } from '../data/mockEvents'

export function useEventDashboard() {
  const { events, isLoading, error, addEvent, updateEvent } = useEventStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Single filtered array flows into both DataGrid and Timeline, keeping them in sync.
  const filteredEvents = useMemo(
    () => events.filter((e) => {
      if (fromDate && e.date < fromDate) return false
      if (toDate && e.date > toDate) return false
      return true
    }),
    [events, fromDate, toDate]
  )

  // Stores the element that opened the modal so focus can be restored on close,
  // keeping the Timeline's roving tabindex state intact.
  const returnFocusRef = useRef<HTMLElement | null>(null)

  function openNewEvent() {
    setFormOpen(true)
  }

  function handleEdit(event: Event) {
    returnFocusRef.current = document.activeElement as HTMLElement
    setEditingEvent(event)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditingEvent(null)
    const target = returnFocusRef.current
    requestAnimationFrame(() => target?.focus())
  }

  function handleSave(data: EventFormData) {
    if (editingEvent) {
      updateEvent(editingEvent.id, { ...data, description: data.description ?? '' })
    } else {
      addEvent({ ...data, description: data.description ?? '' })
    }
  }

  return {
    filteredEvents,
    isLoading,
    error,
    formOpen,
    editingEvent,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    clearDateFilter: () => { setFromDate(''); setToDate('') },
    openNewEvent,
    handleEdit,
    handleClose,
    handleSave,
  }
}
