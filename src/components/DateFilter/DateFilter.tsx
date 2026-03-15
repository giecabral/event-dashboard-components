import * as React from 'react'
import { addDays, format, startOfDay } from 'date-fns'
import { CalendarIcon } from '@heroicons/react/20/solid'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface DateFilterProps {
  fromDate: string
  toDate: string
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  onClear: () => void
}

const presets = [
  { label: 'Tomorrow', days: 1 },
  { label: 'Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: 'Month', days: 30 },
]

function toISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function parseISO(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function DateFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const range: DateRange = {
    from: fromDate ? parseISO(fromDate) : undefined,
    to: toDate ? parseISO(toDate) : undefined,
  }

  // Show the month containing 'from', defaulting to current month
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    range.from
      ? new Date(range.from.getFullYear(), range.from.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )

  const hasFilter = !!(fromDate || toDate)

  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function applyPreset(days: number) {
    const today = startOfDay(new Date())
    const target = addDays(today, days)
    onFromDateChange(toISO(today))
    onToDateChange(toISO(target))
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  function handleSelect(selected: DateRange | undefined) {
    if (!selected) {
      onClear()
      return
    }
    onFromDateChange(selected.from ? toISO(selected.from) : '')
    onToDateChange(selected.to ? toISO(selected.to) : '')
  }

  const triggerLabel = (() => {
    if (fromDate && toDate) {
      return `${format(parseISO(fromDate), 'MMM d, yyyy')} – ${format(parseISO(toDate), 'MMM d, yyyy')}`
    }
    if (fromDate) return `From ${format(parseISO(fromDate), 'MMM d, yyyy')}`
    if (toDate) return `Until ${format(parseISO(toDate), 'MMM d, yyyy')}`
    return 'Date Range'
  })()

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open date filter"
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm shadow-sm focus:outline-none transition-colors ${hasFilter
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
      >
        <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-fit shadow-xl">
            <CardContent className="pt-1 pb-2">
              <Calendar
                mode="range"
                selected={range}
                onSelect={handleSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                numberOfMonths={2}
                fixedWeeks
                className="p-0 [--cell-size:1.75rem] text-xs"
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => applyPreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
              {hasFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => { onClear(); setOpen(false) }}
                >
                  Clear
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
