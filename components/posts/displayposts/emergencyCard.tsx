import { Clock, AlertTriangle } from "lucide-react";
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
  const accentGradient = isUrgent
    ? "from-rose-500 to-orange-500"
    : "from-sky-500 to-indigo-500";

  const softBlob = isUrgent ? "bg-rose-50" : "bg-sky-50";
  const badgeBg = isUrgent ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600";
  const titleColor = "text-slate-800";

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border bg-white",
        "shadow-sm transition hover:shadow-lg hover:border-slate-200",
        "h-[150px] p-4 flex flex-col justify-between",
      ].join(" ")}
    >
      {/* Left accent ribbon */}
      <div
        className={[
          "pointer-events-none absolute left-0 top-0 h-full w-1.5",
          "bg-gradient-to-b", accentGradient,
        ].join(" ")}
      />

      {/* Soft background accent */}
      <div
        className={[
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20",
          softBlob,
          "blur-xl",
        ].join(" ")}
      />

      {/* Header: title + badge */}
      <div className="flex items-start justify-between gap-3">
        <h2 className={`text-sm font-semibold ${titleColor} line-clamp-1`}>
          {title}
        </h2>

        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            badgeBg,
            "ring-1 ring-inset",
            isUrgent ? "ring-rose-200" : "ring-slate-200",
          ].join(" ")}
          title={isUrgent ? "Time-sensitive request" : "General request"}
        >
          {isUrgent && <AlertTriangle className="h-3.5 w-3.5" />}
          {isUrgent ? "Urgent" : "Request"}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-slate-600 line-clamp-2">
        {description}
      </p>

      {/* Footer: time + (urgent pulse) */}
      <div className="mt-auto flex items-center justify-end gap-2 text-xs text-slate-400">
        {isUrgent && (
          <span className="mr-1 inline-flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          </span>
        )}
        <Clock className="h-4 w-4" />
        <span>{getRelativeTime(created_at)}</span>
      </div>

      {/* Hover lift effect */}
      <div className="pointer-events-none absolute inset-0 ring-0 ring-transparent transition group-hover:ring-1 group-hover:ring-slate-100 rounded-xl" />
    </div>
  );
}
