import * as React from "react";
import {
  createColumnHelper,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type Row,
  type RowData,
} from "@tanstack/react-table";
import { PiArrowDownBold, PiArrowUpBold } from "react-icons/pi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DataTableColumnMeta = {
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
};

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  any
>;

type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>;

/** Column helper typed for DataTable, so `meta` and sorting options are checked. */
function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type DataTableProps<TData extends RowData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: DataTableRow<TData>) => void;
  enableSorting?: boolean;
  stickyHeader?: boolean;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyState?: React.ReactNode;
  paginationMode?: "none" | "infinite";
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreRootMargin?: string;
  fetchingMoreRowCount?: number;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  headerRowClassName?: string;
  headClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: DataTableRow<TData>) => string | undefined);
  cellClassName?: string;
  emptyClassName?: string;
};

const alignClassName: Record<
  NonNullable<DataTableColumnMeta["align"]>,
  string
> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  onRowClick,
  enableSorting = false,
  stickyHeader = true,
  isLoading = false,
  loadingRowCount = 10,
  emptyState = "No results found.",
  paginationMode = "none",
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  loadMoreRootMargin = "0px 0px 120px 0px",
  fetchingMoreRowCount = 3,
  onScroll,
  className,
  tableClassName,
  headerClassName,
  headerRowClassName,
  headClassName,
  bodyClassName,
  rowClassName,
  cellClassName,
  emptyClassName,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    enableSorting,
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getAllLeafColumns();
  const isInfinite = paginationMode === "infinite";

  // The wrapper scrolls the rows; the sentinel after them loads the next batch
  // once it comes into view.
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const onLoadMoreRef = React.useRef(onLoadMore);
  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const canLoadMore = isInfinite && hasMore && !isLoading && !isFetchingMore;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canLoadMore || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current?.();
        }
      },
      { root: scrollRef.current, rootMargin: loadMoreRootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, loadMoreRootMargin, data.length]);

  const skeletonRows = (count: number, keyPrefix: string) =>
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={`${keyPrefix}-${index}`} className="hover:bg-transparent">
        {leafColumns.map((column) => (
          <TableCell key={column.id} className={cellClassName}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    // `className` (padding included) goes on the outer div. The inner div is
    // the unpadded scroll container: sticky headers stop at a scroller's
    // padding edge, so padding there lets rows show through above the header.
    <div
      data-slot="data-table"
      className={cn("flex min-h-0 flex-col", className)}
    >
      <div
        ref={scrollRef}
        data-slot="data-table-scroll"
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-auto"
      >
        {/* The scroll div owns both axes; a nested overflow-x-auto container
          would capture the sticky header and stop it sticking. */}
        <Table
          containerClassName="overflow-visible"
          className={cn("bg-surface-base", tableClassName)}
        >
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={cn("hover:bg-transparent", headerRowClassName)}
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={cn(
                        "bg-surface-level-00 first:rounded-tl-4 last:rounded-tr-4",
                        stickyHeader && "sticky top-0 z-10",
                        meta?.align && alignClassName[meta.align],
                        canSort && "cursor-pointer select-none",
                        headClassName,
                        meta?.headerClassName,
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" && (
                            <PiArrowUpBold className="size-3" />
                          )}
                          {sorted === "desc" && (
                            <PiArrowDownBold className="size-3" />
                          )}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={bodyClassName}>
            {isLoading ? (
              skeletonRows(loadingRowCount, "loading")
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName,
                  )}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          meta?.align && alignClassName[meta.align],
                          cellClassName,
                          meta?.cellClassName,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={leafColumns.length}
                  className={cn(
                    "h-48 text-center text-display-subtle-01",
                    emptyClassName,
                  )}
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
            {isInfinite &&
              isFetchingMore &&
              skeletonRows(fetchingMoreRowCount, "fetching-more")}
          </TableBody>
        </Table>
        {isInfinite && (
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        )}
      </div>
    </div>
  );
}

export { DataTable, createDataTableColumnHelper };
export type {
  DataTableProps,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableRow,
};
