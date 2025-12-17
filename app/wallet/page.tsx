"use client";

import { useEffect, useState, useCallback } from "react";
import { WalletBalances } from "@/components/wallet/wallet-balance";
import { WalletHistory } from "@/components/wallet/wallet-history";
import { Button } from "@/components/ui/button";
import CashInDialog from "@/components/wallet/cash-in-dialog";
import CashOutDialog from "@/components/wallet/cash-out-dialog";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";

/* Mobile navigation */
const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

export default function UserWalletPage() {
  const supabase = createClient();

  const [balance, setBalance] = useState<number | null>(null);
  const [escrow, setEscrow] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cashInOpen, setCashInOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);

  const [userId, setUserId] = useState<string>("");

  /* Load logged-in user */
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id || "";
      setUserId(id);
    };

    loadUser();
  }, []);

  /* Load wallet data */
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
    <>
      {/* Mobile navigation */}
      <MobileTopNav />

      {/* Mobile padding */}
      <main className="min-h-screen bg-background text-foreground pt-2 px-6 pb-6 md:p-12">
        <div className="max-w-6xl mx-auto">

          <div className="mb-8 -mt-15 md:mt-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Wallet Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your funds with confidence
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-[#577C8E] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#456273]"
                onClick={() => setCashInOpen(true)}
                disabled={!userId}
              >
                Cash In
              </Button>

              <Button
                className="bg-[#E59E2C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#c7831f]"
                onClick={() => setCashOutOpen(true)}
                disabled={!userId}
              >
                Cash Out
              </Button>
            </div>
          </div>

          <WalletBalances
            balance={balance}
            escrow={escrow}
            loading={loading}
          />

          <WalletHistory transactions={transactions} />
        </div>

        <CashInDialog
          open={cashInOpen}
          onOpenChange={(open) => {
            setCashInOpen(open);
            if (!open) loadWalletData();
          }}
          userId={userId}
        />

        <CashOutDialog
          open={cashOutOpen}
          onOpenChange={(open) => {
            setCashOutOpen(open);
            if (!open) loadWalletData();
          }}
          availableBalance={balance ?? 0}
        />
      </main>
    </>
  );
}
