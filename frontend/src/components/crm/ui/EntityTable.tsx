import { ReactNode, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

export type EntityColumn<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

interface EntityTableProps<T> {
  data: T[];
  columns: EntityColumn<T>[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  pageSize?: number;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  ariaLabel?: string;
}

export function EntityTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading,
  emptyState,
  pageSize = 10,
  skeletonRows = 5,
  onRowClick,
  ariaLabel,
}: EntityTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") return direction === "asc" ? aVal - bVal : bVal - aVal;
      const aStr = (aVal ?? "").toString().toLowerCase();
      const bStr = (bVal ?? "").toString().toLowerCase();
      return direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [data, direction, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  return (
    <div className="space-y-3">
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {isLoading &&
          Array.from({ length: skeletonRows }).map((_, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        {!isLoading && paged.length === 0 && emptyState}
        {!isLoading &&
          paged.map((row, idx) => (
            <button
              key={(row as any).id ?? idx}
              onClick={() => onRowClick?.(row)}
              className="w-full text-left rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-sm font-semibold text-foreground">{columns[0]?.render ? columns[0].render(row) : String((row as any)[columns[0].key])}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {columns[1]?.render ? columns[1].render(row) : columns[1] ? String((row as any)[columns[1].key] ?? "—") : null}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {columns.slice(2, 5).map((col) => (
                  <div key={String(col.key)} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80 mr-1">{col.header}:</span>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                  </div>
                ))}
              </div>
            </button>
          ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
        <Table aria-label={ariaLabel}>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn("text-xs uppercase tracking-wide text-muted-foreground", col.className, col.sortable && "cursor-pointer select-none")}
                  onClick={() => handleSort(String(col.key), col.sortable)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className="py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((row, idx) => (
                <TableRow
                  key={(row as any).id ?? idx}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/40")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn("py-4", col.align === "right" && "text-right")}>{col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && sortedData.length > pageSize && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} / {totalPages}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
