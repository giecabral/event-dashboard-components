import { create } from 'zustand'
import { mockEvents, type Event } from '../data/mockEvents'

interface EventStore {
  events: Event[]
  isLoading: boolean
  error: string | null
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id'>>) => void
}

export const useEventStore = create<EventStore>((set) => ({
  events: mockEvents,
  isLoading: false,
  error: null,

  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, id: crypto.randomUUID() },
      ],
    })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
}))
