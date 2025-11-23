"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  selectedReportReason: string;
  setSelectedReportReason: (reason: string) => void;

  onSubmit: () => void;
};

export default function ReportTransacDialog({
  open,
  onOpenChange,
  selectedReportReason,
  setSelectedReportReason,
  onSubmit,
}: ReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="space-y-3"
      >
        {/* Close Button */}
        <DialogClose asChild>
          <button
            className="absolute right-2 top-2 rounded p-1 hover:cursor-pointer bg-transparent"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <RadioGroup
            value={selectedReportReason}
            onValueChange={(value) => {
              setSelectedReportReason(value);
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="User did not show up in a confirmed meetup" id="r1" />
              <Label htmlFor="r1">User did not show up in a confirmed meetup</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="User failed to deliver or send the item after payment" id="r2" />
              <Label htmlFor="r2">User failed to deliver or send the item after payment</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="User refused to pay after confirming purchase" id="r3" />
              <Label htmlFor="r3">User refused to pay after confirming purchase</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Product received is fake, wrong, or severely damaged" id="r4" />
              <Label htmlFor="r4">Product received is fake, wrong, or severely damaged</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Cancellation without prior notice" id="r5" />
              <Label htmlFor="r5">Cancellation without prior notice</Label>
            </div>
          </RadioGroup>

          {/* Submit Button */}
          <Button type="submit" className="hover:cursor-pointer">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
