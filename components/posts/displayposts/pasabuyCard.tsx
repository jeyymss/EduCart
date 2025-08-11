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
        <span className="text-[#E59E2C] font-medium text-sm">
          {serviceFee != null
            ? `₱${serviceFee.toLocaleString()}`
            : "Price not listed"}
        </span>

        <div className="flex">
          <Clock className="w-4 h-4 mr-1" />
          <span>{getRelativeTime(created_at)}</span>
        </div>
      </div>
    </div>
  );
}
