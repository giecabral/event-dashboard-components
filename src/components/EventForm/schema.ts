import { z } from 'zod'

export const eventSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  date:        z.string()
                 .min(1, 'Date is required')
                 .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
                 .refine((v) => !isNaN(new Date(v).getTime()), 'Enter a valid date'),
  time:        z.string().min(1, 'Time is required'),
  location:    z.string().min(1, 'Location is required'),
  category:    z.string().min(1, 'Category is required'),
  status:      z.enum(['scheduled', 'completed', 'cancelled']),
  attendees:   z.coerce.number({ error: 'Must be a number' })
                .int()
                .min(1, 'At least 1 attendee required'),
  organizer:   z.string().min(1, 'Organizer is required'),
  description: z.string().optional(),
})

export type EventFormData = z.infer<typeof eventSchema>
