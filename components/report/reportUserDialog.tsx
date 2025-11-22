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

  otherText: string;
  setOtherText: (value: string) => void;

  onSubmit: () => void;
};

export default function ReportUserDialog({
  open,
  onOpenChange,
  selectedReportReason,
  setSelectedReportReason,
  otherText,
  setOtherText,
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
              if (value !== "OtherReport") {
                setOtherText("");
              }
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="Use of inappropriate language" id="r1" />
              <Label htmlFor="r1">Use of inappropriate language</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Spam or repetitive posting" id="r2" />
              <Label htmlFor="r2">Spam or repetitive posting</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Misleading profile info" id="r3" />
              <Label htmlFor="r3">Misleading profile info</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Fraud, scam, or impersonation" id="r4" />
              <Label htmlFor="r4">Fraud, scam, or impersonation</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Harassment or abusive behavior" id="r5" />
              <Label htmlFor="r5">Harassment or abusive behavior</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Sharing false or dangerous info" id="r6" />
              <Label htmlFor="r6">Sharing false or dangerous info</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="Repeated violations despite warnings" id="r7" />
              <Label htmlFor="r7">Repeated violations despite warnings</Label>
            </div>

            {/* OTHER OPTION */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="Other Report" id="r8" />
                <Label htmlFor="r8">Other</Label>
              </div>

              {selectedReportReason === "OtherReport" && (
                <Input
                  placeholder="Please specify..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  className="mt-1"
                />
              )}
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
