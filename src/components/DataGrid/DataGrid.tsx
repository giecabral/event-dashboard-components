import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid'
import { ColumnToggle } from './ColumnToggle'
import { CATEGORY_STYLES, STATUS_STYLES } from '../../lib/categoryColors'
import type { Event } from '../../data/mockEvents'

export type DataGridColumn = ColumnDef<Event> & {
  header: string
  accessorKey: keyof Event
}

interface DataGridProps {
  data: Event[]
  columns: DataGridColumn[]
  isLoading?: boolean
  error?: string | null
  pageSize?: number
}

export function DataGrid({
  data,
  columns,
  isLoading = false,
  error = null,
  pageSize = 10,
}: DataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * currentPageSize + 1
  const to = Math.min((pageIndex + 1) * currentPageSize, filteredCount)

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <ColumnToggle table={table} />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-sm" role="grid" aria-label="Events data grid">
          <colgroup>
            {table.getFlatHeaders().map((header) => (
              <col key={header.id} style={{ width: header.getSize() }} />
            ))}
          </colgroup>
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
                      className="px-3 py-2 text-left"
                      aria-sort={
                        sorted === 'asc' ? 'ascending'
                        : sorted === 'desc' ? 'descending'
                        : canSort ? 'none'
                        : undefined
                      }
                    >
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 ${canSort ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        role={canSort ? 'button' : undefined}
                        tabIndex={canSort ? 0 : undefined}
                        onKeyDown={canSort ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        } : undefined}
                        aria-label={canSort ? `Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id}` : undefined}
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

                      {/* Per-column filter inputs are hidden for now.
                          The columnFilters state and getFilteredRowModel() logic remain active
                          so filters can be re-exposed without any changes here. */}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <span className="inline-block animate-spin mr-2" aria-hidden="true">⟳</span>
                  Loading events…
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="font-medium text-red-600">Failed to load events</p>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </td>
              </tr>
            )}

            {!isLoading && !error && table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  No events found.
                </td>
              </tr>
            )}

            {!isLoading && !error &&
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => {
                    const colId = cell.column.id
                    const value = cell.getValue() as string

                    return (
                      <td key={cell.id} className="px-3 py-2 text-gray-700 overflow-hidden">
                        {colId === 'status' ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${STATUS_STYLES[value] ?? ''}`}>
                            {value}
                          </span>
                        ) : colId === 'category' ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[value]?.badge ?? 'text-gray-600 bg-gray-50 ring-gray-200'}`}>
                            {value}
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
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            Showing {from} to {to} of {filteredCount} event{filteredCount !== 1 ? 's' : ''}
          </span>
          <label className="flex items-center gap-1.5">
            Show
            <select
              value={currentPageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
                table.setPageIndex(0)
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Rows per page"
            >
              {[5, 10, 15, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            entries
          </label>
        </div>

        <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>

          <span className="px-2 text-gray-500">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
