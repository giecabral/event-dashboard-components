import { faker } from '@faker-js/faker'

export type EventStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Event {
  id: string
  title: string
  description: string
  date: string        // ISO date string (YYYY-MM-DD)
  time: string        // HH:mm
  location: string
  category: string
  status: EventStatus
  attendees: number
  organizer: string
}

const CATEGORIES = ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Training']
const STATUSES: EventStatus[] = ['scheduled', 'completed', 'cancelled']

// Seed for reproducible data across hot reloads
faker.seed(42)

function generateEvent(): Event {
  const date = faker.date.between({
    from: new Date('2025-01-01'),
    to: new Date('2025-12-31'),
  })

  return {
    id: faker.string.uuid(),
    title: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.sentence(),
    date: date.toISOString().split('T')[0],
    time: faker.helpers.arrayElement(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    category: faker.helpers.arrayElement(CATEGORIES),
    status: faker.helpers.arrayElement(STATUSES),
    attendees: faker.number.int({ min: 5, max: 500 }),
    organizer: faker.person.fullName(),
  }
}

// 200 events — enough for both the DataGrid (100–500 rows) and Timeline (30–100 events)
export const mockEvents: Event[] = Array.from({ length: 200 }, generateEvent)
  .sort((a, b) => a.date.localeCompare(b.date))
