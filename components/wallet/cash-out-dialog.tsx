"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CashOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number; 
}

export default function CashOutDialog({
  open,
  onOpenChange,
  availableBalance,
}: CashOutDialogProps) {
  const [amount, setAmount] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const fee = amount ? Math.max(10, Number(amount) * 0.02) : 0; 
  const total = Number(amount) + fee;

  const handleCashOut = async () => {
    if (!amount || !gcashNumber) return alert("Please fill all fields.");

    if (Number(amount) > availableBalance)
      return alert("Insufficient wallet balance.");

    setLoading(true);

    // 🔧 BACKEND API (to be implemented)
    // await fetch("/api/wallet/cashout", {
    //   method: "POST",
    //   body: JSON.stringify({ amount, gcashNumber }),
    // });

    setTimeout(() => {
      setLoading(false);
      alert("Cash Out request submitted!");
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#577C8E]">
            Cash Out
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* AMOUNT */}
          <div>
            <Label>Amount to Withdraw</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available Balance: ₱{availableBalance.toLocaleString()}
            </p>
          </div>

          {/* GCASH NUMBER */}
          <div>
            <Label>GCash Number</Label>
            <Input
              type="tel"
              placeholder="09xxxxxxxxx"
              value={gcashNumber}
              onChange={(e) => setGcashNumber(e.target.value)}
            />
          </div>

          {/* FEE BREAKDOWN */}
          {amount && (
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span>₱{Number(amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span>₱{fee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold mt-2">
                <span>Total Deducted:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>
          )}
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
