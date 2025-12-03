"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  userId: string;
}

export default function CashInDialog({ open, onOpenChange, userId }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCashIn = async () => {
    if (!amount) return alert("Please enter an amount.");

    setLoading(true);

    const res = await fetch("/api/wallet/cashin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, userId }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.checkout_url) {
      window.location.href = json.checkout_url;
    } else {
      alert("Failed to initialize Cash In.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#577C8E]">Cash In</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button className="bg-[#E59E2C]" onClick={handleCashIn} disabled={loading}>
            {loading ? "Processing..." : "Proceed to GCash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
