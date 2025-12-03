"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlatformCashOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export default function PlatformCashOutDialog({
  open,
  onOpenChange,
  currentBalance,
}: PlatformCashOutDialogProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCashOut = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (Number(amount) > currentBalance) {
      alert("Insufficient platform balance.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/wallet/cashout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(json.error || "Cash out failed");
      return;
    }

    alert(`Platform Cash Out Completed!\nReference: ${json.reference_code}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#577C8E]">
            Platform Cash Out
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Amount to Withdraw</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Current Balance: ₱{currentBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="bg-[#E59E2C] text-white px-6 py-2 rounded-lg"
            onClick={handleCashOut}
            disabled={loading || Number(amount) <= 0}
          >
            {loading ? "Processing..." : "Confirm Cash Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
