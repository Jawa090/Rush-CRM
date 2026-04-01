import { Skeleton } from "@/components/ui/skeleton";

interface DriveFileListSkeletonProps {
  rows?: number;
}

export function DriveFileListSkeleton({ rows = 8 }: DriveFileListSkeletonProps) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[30%]" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}
