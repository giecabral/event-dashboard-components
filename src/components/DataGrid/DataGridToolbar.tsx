import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import type { Table } from '@tanstack/react-table'
import { ColumnToggle } from './ColumnToggle'
import type { Event } from '../../data/mockEvents'

interface DataGridToolbarProps {
  table: Table<Event>
}

export function DataGridToolbar({ table }: DataGridToolbarProps) {
  const globalFilter = (table.getState().globalFilter as string) ?? ''

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="relative flex-1 max-w-xs">
        <MagnifyingGlassIcon
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search title, category, status…"
          value={globalFilter}
          onChange={(e) => {
            table.setGlobalFilter(e.target.value)
            table.setPageIndex(0)
          }}
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-8 text-xs shadow-sm focus:outline-none"
        />
        {globalFilter && (
          <button
            onClick={() => {
              table.setGlobalFilter('')
              table.setPageIndex(0)
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      <ColumnToggle table={table} />
    </div>
  )
}
