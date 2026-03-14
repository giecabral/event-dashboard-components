// Shared color tokens for category badges and Timeline dots.
// Category uses amber / violet / teal / sky / fuchsia / indigo
// — intentionally avoiding blue, green, red which are reserved for status.
export const CATEGORY_STYLES: Record<string, { dot: string; badge: string }> = {
  Conference: { dot: 'bg-amber-500',   badge: 'text-amber-700 bg-amber-50 ring-amber-200'     },
  Workshop:   { dot: 'bg-violet-500',  badge: 'text-violet-700 bg-violet-50 ring-violet-200'  },
  Meetup:     { dot: 'bg-teal-500',    badge: 'text-teal-700 bg-teal-50 ring-teal-200'        },
  Webinar:    { dot: 'bg-sky-500',     badge: 'text-sky-700 bg-sky-50 ring-sky-200'           },
  Social:     { dot: 'bg-fuchsia-500', badge: 'text-fuchsia-700 bg-fuchsia-50 ring-fuchsia-200' },
  Training:   { dot: 'bg-indigo-500',  badge: 'text-indigo-700 bg-indigo-50 ring-indigo-200'  },
}

export const CATEGORY_DOT_DEFAULT = 'bg-gray-400'

export const STATUS_STYLES: Record<string, string> = {
  scheduled: 'text-blue-700 bg-blue-50 ring-blue-200',
  completed:  'text-green-700 bg-green-50 ring-green-200',
  cancelled:  'text-red-700 bg-red-50 ring-red-200',
}
