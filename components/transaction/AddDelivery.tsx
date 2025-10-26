"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Courier = {
  id: number;
  name: string;
  contact_number?: string;
  price?: number;
};

interface AddDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  onUpdated?: () => void;
}

export function AddDeliveryDialog({
  open,
  onOpenChange,
  transactionId,
  onUpdated
}: AddDeliveryDialogProps) {
  const [couriers, setCouriers] = React.useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const supabase = createClient();

  // Fetch couriers when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchCouriers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("couriers")
          .select("id, name")
          .order("name");

        if (error) {
          console.error(error);
          toast.error("Failed to load couriers.");
        } else {
          setCouriers(data || []);
        }
        setIsLoading(false);
      };
      fetchCouriers();
    }
  }, [open, supabase]);

  // Submit selected courier
  const handleSubmit = async () => {
    if (!selectedCourier) {
      toast.error("Please select a courier before saving.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving courier...");

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ courier_id: Number(selectedCourier) })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("Courier successfully assigned!");
      onOpenChange(false);
      onUpdated?.(); // ✅ trigger parent refetch
      // window.location.reload(); // optional fallback if no re-fetch system
    } catch (err) {
      console.error("Error updating courier:", err);
      toast.error("Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl border shadow-lg transition-all">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Assign Courier
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Choose a courier for this delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Select Courier
          </Label>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : (
            <Select
              onValueChange={(v) => setSelectedCourier(v)}
              value={selectedCourier}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose courier" />
              </SelectTrigger>
              <SelectContent>
                {couriers.length > 0 ? (
                  couriers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {c.name}
                        </span>
                        {c.price && (
                          <span className="text-xs text-gray-500">
                            ₱{c.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No couriers found
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter className="mt-3 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting} className="hover:cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCourier || isSubmitting}
            className="bg-[#102E4A] hover:bg-[#0d2439] text-white transition-all hover:cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
