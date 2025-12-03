"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/utils/supabase/client";

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
  const [userId, setUserId] = useState<string | null>(null);

  // Load logged-in userId
  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    loadUser();
  }, []);

  const validateGCash = (num: string) => /^09\d{9}$/.test(num);

  const handleCashOut = async () => {
    if (!userId) return alert("User not logged in.");
    if (!amount || !gcashNumber) return alert("Please fill all fields.");

    if (Number(amount) > availableBalance)
      return alert("Insufficient wallet balance.");

    if (!validateGCash(gcashNumber))
      return alert("Please enter a valid GCash number (09xxxxxxxxx).");

    setLoading(true);

    const res = await fetch("/api/wallet/cashout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount: Number(amount),
        gcash_number: gcashNumber,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.error) {
      alert(json.error);
      return;
    }

    alert("Cash Out request submitted!");
    onOpenChange(false);
    setAmount("");
    setGcashNumber("");
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
          {/* AMOUNT INPUT */}
          <div>
            <Label>Amount to Withdraw</Label>
            <Input
              type="number"
              min="1"
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
              maxLength={11}
              value={gcashNumber}
              onChange={(e) => setGcashNumber(e.target.value)}
            />
          </div>

          {/* SUMMARY */}
          {amount && (
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total Deducted:</span>
                <span>₱{Number(amount).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="bg-[#E59E2C] text-white px-6 py-2 rounded-lg"
            onClick={handleCashOut}
            disabled={loading || Number(amount) <= 0 || !userId}
          >
            {loading ? "Processing..." : "Confirm Cash Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
