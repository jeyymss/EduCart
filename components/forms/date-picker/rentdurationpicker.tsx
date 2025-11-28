"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Props = {
  onChange?: (start: string | null, end: string | null) => void;
};

export default function RentDurationPicker({ onChange }: Props) {
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);

  // Tomorrow (earliest allowed)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleStart = (value: string) => {
    setStart(value);

    // If new start date > current end date → reset end date
    if (end && value > end) {
      setEnd(null);
      onChange?.(value, null); // ✅ always send 2 params
      return;
    }

    onChange?.(value, end); // ✅ always send 2 params
  };

  const handleEnd = (value: string) => {
    setEnd(value);
    onChange?.(start, value); // ✅ always send 2 params
  };

  // Format function (YYYY-MM-DD → "Month DD, YYYY")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white w-full">

      <div className="flex justify-between gap-4">
        
        {/* Start Date */}
        <div className="flex flex-col w-1/2">
          <Label className="font-medium mb-1 text-sm">Start Date</Label>
          <Input
            type="date"
            className="border rounded-md px-3 py-2"
            min={tomorrow}
            value={start || ""}
            onChange={(e) => handleStart(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col w-1/2">
          <Label className="font-medium mb-1 text-sm">End Date</Label>
          <Input
            type="date"
            className="border rounded-md px-3 py-2"
            min={start || tomorrow}
            value={end || ""}
            onChange={(e) => handleEnd(e.target.value)}
          />
        </div>

      </div>

      {/* Display formatted date range */}
      {start && end && (
        <div className="text-sm font-medium text-center bg-gray-50 p-3 rounded-md border">
          <p>
            {formatDate(start)} → {formatDate(end)}
          </p>
        </div>
      )}
    </div>
  );
}
