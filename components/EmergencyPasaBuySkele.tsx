import { Skeleton } from "./ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-sm space-y-6 animate-pulse">
      {/* Title and urgent badge */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-3/4 rounded bg-gray-400" />
        <Skeleton className="h-5 w-12 rounded-full bg-gray-300" />
      </div>

      {/* Description lines */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
        <Skeleton className="h-4 w-full rounded bg-gray-200" />
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}
