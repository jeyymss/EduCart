"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Loader2, MapPin, Truck, PackageCheck, Clock } from "lucide-react";

interface CourierStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

type CourierStatus = {
  courier_name: string;
  status: string;
  updated_at: string;
  estimated_delivery?: string | null;
};

export function CourierStatusDialog({
  open,
  onOpenChange,
  transactionId,
}: CourierStatusDialogProps) {
  const supabase = createClient();
  const [status, setStatus] = useState<CourierStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchCourierStatus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          courier_id,
          courier:courier_id (
            name
          ),
          status,
          updated_at
        `
        )
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Failed to fetch courier status:", error);
        setLoading(false);
        return;
      }

      const courierStatus: CourierStatus = {
        courier_name:
            (data as any)?.courier?.[0]?.name ||
            (data as any)?.courier?.name ||
            "Unknown Courier",
        status: data?.status || "Processing",
        updated_at: new Date(data?.updated_at).toLocaleString(),
      };

      setStatus(courierStatus);
      setLoading(false);
    };

    fetchCourierStatus();
  }, [open, transactionId, supabase]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Courier Status
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Track your delivery status for this transaction.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Courier:</span>
              <span className="font-medium text-gray-900">
                {status.courier_name}
              </span>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                {status.status === "Accepted" ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : status.status === "Picked Up" ? (
                  <PackageCheck className="h-4 w-4 text-orange-500" />
                ) : status.status === "On The Way" ? (
                  <Truck className="h-4 w-4 text-indigo-500" />
                ) : status.status === "Delivered" ? (
                  <MapPin className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-500" />
                )}
                <span className="capitalize font-medium">{status.status}</span>
              </div>

              <p className="text-xs text-gray-500">
                Last updated: {status.updated_at}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 py-4">
            No courier information found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
