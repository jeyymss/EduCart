import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelativeTime } from "@/utils/getRelativeTime";

type PasabuyCardProps = {
  id: string;
  title: string;
  description: string;
  serviceFee: number;
  created_at: string;
};

export function PasabuyCard({
  title,
  description,
  serviceFee,
  created_at,
}: PasabuyCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white space-y-2 hover:cursor-pointer h-[150px] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <h2 className="text-md font-semibold text-gray-800">{title}</h2>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
        <div>
          <h1>Service Fee: {serviceFee}</h1>
        </div>

        <div className="flex">
          <Clock className="w-4 h-4 mr-1" />
          <span>{getRelativeTime(created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export function PasaBuyPostCardSkeleton() {
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
