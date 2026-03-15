import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { CATEGORY_STYLES, STATUS_STYLES } from '../../lib/categoryColors'
import type { Event } from '../../data/mockEvents'

interface DataGridBodyProps {
  table: Table<Event>
  isLoading: boolean
  error: string | null
  onRowClick?: (event: Event) => void
}

// Widths cycle deterministically across rows and columns to vary skeleton bar lengths
const SKELETON_WIDTHS = ['75%', '60%', '80%', '55%', '70%']

export function DataGridBody({ table, isLoading, error, onRowClick }: DataGridBodyProps) {
  const visibleColumns = table.getVisibleFlatColumns()
  const colCount = visibleColumns.length
  const { pageSize } = table.getState().pagination

  if (isLoading) {
    return (
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: pageSize }).map((_, rowIdx) => (
          <tr key={rowIdx} aria-hidden="true">
            {visibleColumns.map((col, colIdx) => (
              <td key={col.id} className="px-3 py-2">
                <div
                  className="h-3.5 rounded bg-gray-200 animate-pulse"
                  style={{ width: SKELETON_WIDTHS[(rowIdx + colIdx) % SKELETON_WIDTHS.length] }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={colCount} className="px-4 py-12 text-center">
            <p className="font-medium text-red-600">Failed to load events</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </td>
        </tr>
      </tbody>
    )
  }

  const rows = table.getRowModel().rows

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={colCount} className="px-4 py-12 text-center text-gray-400">
            No events found.
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="divide-y divide-gray-100">
      {rows.map((row) => (
        <tr
          key={row.id}
          className={`group transition-colors hover:bg-gray-100 ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick?.(row.original)}
        >
          {row.getVisibleCells().map((cell, cellIndex) => {
            const colId = cell.column.id
            const value = cell.getValue() as string
            const isFirst = cellIndex === 0

            return (
              <td key={cell.id} title={String(value)} className="px-3 py-2 text-gray-700 overflow-hidden">
                {colId === 'status' ? (
                  <StatusBadge value={value} />
                ) : colId === 'category' ? (
                  <CategoryBadge value={value} />
                ) : isFirst ? (
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                    {onRowClick && (
                      <PencilSquareIcon
                        className="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                ) : (
                  <span className="block truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                )}
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}

// File-private badge helpers — only meaningful within the grid cell context
function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${STATUS_STYLES[value] ?? ''}`}>
      {value}
    </span>
  )
}

function CategoryBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[value]?.badge ?? 'text-gray-600 bg-gray-50 ring-gray-200'}`}>
      {value}
    </span>
  )
}
