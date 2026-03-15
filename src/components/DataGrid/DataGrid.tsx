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
  PencilSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { ColumnToggle } from './ColumnToggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  onRowClick?: (event: Event) => void
}

export function DataGrid({
  data,
  columns,
  isLoading = false,
  error = null,
  pageSize = 10,
  onRowClick,
}: DataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
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
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search title, category, status…"
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
            className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-8 text-xs shadow-sm focus:outline-none"
          />
          {globalFilter && (
            <button
              onClick={() => { setGlobalFilter(''); table.setPageIndex(0) }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
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
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && Array.from({ length: pageSize }).map((_, rowIdx) => (
              <tr key={rowIdx} aria-hidden="true">
                {table.getVisibleFlatColumns().map((col, colIdx) => (
                  <td key={col.id} className="px-3 py-2">
                    <div
                      className="h-3.5 rounded bg-gray-200 animate-pulse"
                      style={{ width: `${['75%', '60%', '80%', '55%', '70%'][(rowIdx + colIdx) % 5]}` }}
                    />
                  </td>
                ))}
              </tr>
            ))}

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
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${STATUS_STYLES[value] ?? ''}`}>
                            {value}
                          </span>
                        ) : colId === 'category' ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[value]?.badge ?? 'text-gray-600 bg-gray-50 ring-gray-200'}`}>
                            {value}
                          </span>
                        ) : isFirst ? (
                          <span className="flex items-center justify-between gap-1">
                            <span className="truncate">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                            {onRowClick && (
                              <PencilSquareIcon className="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
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
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            Showing {from} to {to} of {filteredCount} event{filteredCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            Show
            <Select
              value={String(currentPageSize)}
              onValueChange={(v) => {
                table.setPageSize(Number(v))
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger aria-label="Rows per page" className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 25].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            entries
          </span>
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
