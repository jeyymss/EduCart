"use client";

import { useEffect, useState, useCallback } from "react";
import { WalletBalances } from "@/components/wallet/wallet-balance";
import { WalletHistory } from "@/components/wallet/wallet-history";
import { Button } from "@/components/ui/button";
import CashInDialog from "@/components/wallet/cash-in-dialog";
import CashOutDialog from "@/components/wallet/cash-out-dialog";
import { createClient } from "@/utils/supabase/client";

export default function UserWalletPage() {
  const supabase = createClient();

  const [balance, setBalance] = useState<number | null>(null);
  const [escrow, setEscrow] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cashInOpen, setCashInOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);

  const [userId, setUserId] = useState<string>("");

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id || "";
      setUserId(id);
    };

    loadUser();
  }, []);

  // Load wallet data
  const loadWalletData = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/get");
      const data = await res.json();

      setBalance(data.balance);
      setEscrow(data.escrow);
      setTransactions(data.transactions);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* Header + Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Wallet Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your funds with confidence
            </p>
          </div>

          {/* Right-side button group */}
          <div className="flex gap-3">
            {/* CASH IN BUTTON */}
            <Button
              className="bg-[#577C8E] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#456273] transition-all shadow-sm hover:shadow-md"
              onClick={() => setCashInOpen(true)}
              disabled={!userId}
            >
              Cash In
            </Button>

            {/* CASH OUT BUTTON */}
            <Button
              className="bg-[#E59E2C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#c7831f] shadow-sm hover:shadow-md"
              onClick={() => setCashOutOpen(true)}
              disabled={!userId}
            >
              Cash Out
            </Button>
          </div>
        </div>

        {/* BALANCE CARDS */}
        <WalletBalances balance={balance} escrow={escrow} loading={loading} />

        {/* TRANSACTION HISTORY */}
        <WalletHistory transactions={transactions} />
      </div>

      {/* CASH IN MODAL */}
      <CashInDialog
        open={cashInOpen}
        onOpenChange={(open) => {
          setCashInOpen(open);
          if (!open) loadWalletData(); // refresh after closing dialog
        }}
        userId={userId}
      />

      {/* CASH OUT MODAL */}
      <CashOutDialog
        open={cashOutOpen}
        onOpenChange={(open) => {
          setCashOutOpen(open);
          if (!open) loadWalletData(); // refresh after closing dialog
        }}
        availableBalance={balance ?? 0}
      />
    </main>
  );
}
