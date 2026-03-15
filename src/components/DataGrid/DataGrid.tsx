import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table'
import { DataGridToolbar } from './DataGridToolbar'
import { DataGridHeader } from './DataGridHeader'
import { DataGridBody } from './DataGridBody'
import { DataGridPagination } from './DataGridPagination'
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

/**
 * DataGrid orchestrates state and the TanStack table instance, then delegates
 * all rendering to focused sub-components. Each sub-component receives `table`
 * as its primary prop, using TanStack's API as the shared interface rather than
 * duplicating derived values through the prop tree.
 */
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

  return (
    <div className="flex h-full flex-col gap-3">
      <DataGridToolbar table={table} />

      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-sm" role="grid" aria-label="Events data grid">
          <colgroup>
            {table.getFlatHeaders().map((header) => (
              <col key={header.id} style={{ width: header.getSize() }} />
            ))}
          </colgroup>
          <DataGridHeader table={table} />
          <DataGridBody table={table} isLoading={isLoading} error={error} onRowClick={onRowClick} />
        </table>
      </div>

      <DataGridPagination table={table} />
    </div>
  )
}
