"use client";

import { useEffect, useState } from "react";
import { WalletBalances } from "@/components/wallet/wallet-balance";
import { WalletHistory } from "@/components/wallet/wallet-history";

export default function UserWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [escrow, setEscrow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wallet/get");
      const data = await res.json();

      setBalance(data.balance);
      setEscrow(data.escrow);
      setTransactions(data.transactions);
      setLoading(false);
    }
    load();
  }, []);


  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your funds with confidence
          </p>
        </div>

        {/* Balance Cards */}
        <WalletBalances
          balance={balance}
          escrow={escrow}
          loading={loading}
        />

        {/* Transaction History */}
        <WalletHistory transactions={transactions} />
      </div>
    </main>
  );
}
