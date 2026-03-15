import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import type { Event } from '../../data/mockEvents'

interface DataGridHeaderProps {
  table: Table<Event>
}

export function DataGridHeader({ table }: DataGridHeaderProps) {
  return (
    <thead className="sticky top-0 z-10 bg-gray-50">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort()
            const sorted = header.column.getIsSorted()

            return (
              <th
                key={header.id}
                scope="col"
                className="px-3 py-2 text-left bg-gray-200"
                aria-sort={
                  sorted === 'asc' ? 'ascending'
                    : sorted === 'desc' ? 'descending'
                      : canSort ? 'none'
                        : undefined
                }
              >
                <div
                  className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-800 ${canSort ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  role={canSort ? 'button' : undefined}
                  tabIndex={canSort ? 0 : undefined}
                  onKeyDown={canSort ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      header.column.getToggleSortingHandler()?.(e)
                    }
                  } : undefined}
                  aria-label={canSort
                    ? `Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id}`
                    : undefined
                  }
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="ml-1 text-gray-400" aria-hidden="true">
                      {sorted === 'asc'
                        ? <ChevronUpIcon className="h-3.5 w-3.5" />
                        : sorted === 'desc'
                          ? <ChevronDownIcon className="h-3.5 w-3.5" />
                          : <ChevronUpDownIcon className="h-3.5 w-3.5" />}
                    </span>
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
