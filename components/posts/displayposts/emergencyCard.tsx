import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelativeTime } from "@/utils/getRelativeTime";

type EmergencyRequestCardProps = {
  id: string;
  title: string;
  description: string;
  isUrgent: boolean;
  created_at: string;
};

export function EmergencyCard({
  title,
  description,
  isUrgent,
  created_at,
}: EmergencyRequestCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white space-y-2 hover:cursor-pointer h-[150px] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {isUrgent && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
            Urgent
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>

      <div className="flex items-center justify-end text-xs text-gray-400 mt-auto">
        <Clock className="w-4 h-4 mr-1" />
        <span>{getRelativeTime(created_at)}</span>
      </div>
    </div>
  );
}
