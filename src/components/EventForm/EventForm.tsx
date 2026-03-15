import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/20/solid'
import { eventSchema, type EventFormData } from './schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Event } from '../../data/mockEvents'

interface EventFormProps {
  open: boolean
  onClose: () => void
  initialData?: Event
  onSave: (data: EventFormData) => void
}

const CATEGORIES = ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Social', 'Training']

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function EventForm({ open, onClose, initialData, onSave }: EventFormProps) {
  const isEdit = !!initialData
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData ?? { status: 'scheduled', attendees: 1 },
  })

  // Focus the first invalid field on submit attempt
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof EventFormData | undefined
    if (firstError) setFocus(firstError)
  }, [errors, setFocus])

  // Reset whenever the dialog opens or the event being edited changes
  useEffect(() => {
    if (open) {
      setSaved(false)
      reset(initialData ?? { status: 'scheduled', attendees: 1 })
    }
  }, [open, initialData, reset])

  function onSubmit(data: EventFormData) {
    onSave(data)
    setSaved(true)
    setTimeout(onClose, 1400)
  }

  const base =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-0'
  const err = 'border-red-400'

  return (
    <Dialog.Root open={open} modal={false} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-2xl focus:outline-none"
          aria-describedby={saved ? 'form-success' : 'form-desc'}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              {isEdit ? 'Edit Event' : 'New Event'}
            </Dialog.Title>
            <Dialog.Close
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <VisuallyHidden>
            <Dialog.Description id="form-desc">
              {isEdit ? 'Edit the details of this event.' : 'Fill in the details to create a new event.'}
            </Dialog.Description>
          </VisuallyHidden>

          {/* Success state */}
          {saved ? (
            <div
              id="form-success"
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-3 px-6 py-12 text-center"
            >
              <CheckCircleIcon className="h-12 w-12 text-green-500" aria-hidden="true" />
              <p className="text-base font-medium text-gray-900">
                Event {isEdit ? 'updated' : 'created'} successfully!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-2 gap-4 px-6 py-5">
                <div className="col-span-2">
                  <Field label="Title" error={errors.title?.message} required>
                    <input
                      {...register('title')}
                      className={`${base} ${errors.title ? err : ''}`}
                      aria-invalid={!!errors.title}
                      autoComplete="off"
                    />
                  </Field>
                </div>

                <Field label="Date" error={errors.date?.message} required>
                  <input
                    type="date"
                    {...register('date')}
                    className={`${base} ${errors.date ? err : ''}`}
                    aria-invalid={!!errors.date}
                  />
                </Field>

                <Field label="Time" error={errors.time?.message} required>
                  <input
                    type="time"
                    {...register('time')}
                    className={`${base} ${errors.time ? err : ''}`}
                    aria-invalid={!!errors.time}
                  />
                </Field>

                <Field label="Category" error={errors.category?.message} required>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`w-full h-[34px] focus-visible:ring-0 focus-visible:border-gray-300 ${errors.category ? 'border-red-400' : ''}`}
                          aria-invalid={!!errors.category}
                        >
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent side='bottom' sideOffset={4}>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field label="Status" error={errors.status?.message} required>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`w-full h-[34px] capitalize focus-visible:ring-0 focus-visible:border-gray-300 ${errors.status ? 'border-red-400' : ''}`}
                          aria-invalid={!!errors.status}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Location" error={errors.location?.message} required>
                    <input
                      {...register('location')}
                      className={`${base} ${errors.location ? err : ''}`}
                      aria-invalid={!!errors.location}
                    />
                  </Field>
                </div>

                <Field label="Organizer" error={errors.organizer?.message} required>
                  <input
                    {...register('organizer')}
                    className={`${base} ${errors.organizer ? err : ''}`}
                    aria-invalid={!!errors.organizer}
                  />
                </Field>

                <Field label="Attendees" error={errors.attendees?.message} required>
                  <input
                    type="number"
                    min={1}
                    {...register('attendees')}
                    className={`${base} ${errors.attendees ? err : ''}`}
                    aria-invalid={!!errors.attendees}
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Description" error={errors.description?.message}>
                    <textarea
                      {...register('description')}
                      rows={2}
                      className={`${base} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <Dialog.Close
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                >
                  {isEdit ? 'Save changes' : 'Create event'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
