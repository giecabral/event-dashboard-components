import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import type { Event } from '../../data/mockEvents'
import { Cog6ToothIcon } from '@heroicons/react/20/solid'

interface ColumnToggleProps {
  table: Table<Event>
}

export function ColumnToggle({ table }: ColumnToggleProps) {
  const [open, setOpen] = useState(false)

  const toggleableCols = table.getAllLeafColumns().filter((col) => col.id !== 'actions')
  const visibleCount = toggleableCols.filter((col) => col.getIsVisible()).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Cog6ToothIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        Configure Columns
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="listbox"
            aria-label="Toggle columns"
            aria-multiselectable="true"
            className="absolute right-0 z-20 mt-1 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {toggleableCols.map((col) => {
              const isLastVisible = col.getIsVisible() && visibleCount <= 1
              return (
                <label
                  key={col.id}
                  role="option"
                  aria-selected={col.getIsVisible()}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 ${isLastVisible ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    disabled={isLastVisible}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </label>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
