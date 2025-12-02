"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX, Wallet } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SquareArrowOutUpRight } from "lucide-react";
import WalletTransactionSheet from "@/components/wallet/wallet-transaction-sheet";

// Updated WalletTx type
type WalletTx = {
  id: number;
  amount: number;
  type: string;
  created_at: string;
  transaction_id: string | null;

  // PLATFORM FIELDS
  reference_code: string | null;
  status: string | null;

  // TRANSACTION JOIN (commission transactions)
  transactions: {
    reference_code: string | null;
    status: string | null;
  } | null;
};

export default function WalletPage() {
  const supabase = createClient();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);

  // Fetch platform wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/admin/wallet/balance");
        const data = await res.json();

        if (res.ok) {
          setBalance(data.balance);
        } else {
          console.error("Failed to load balance:", data.error);
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      }
    };

    fetchBalance();
  }, []);

  // Fetch platform wallet transactions
  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch("/api/admin/wallet/transactions");
        const data = await res.json();

        if (res.ok) {
          setTransactions(data.transactions);
        } else {
          console.error("Failed to fetch transactions:", data.error);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, []);

  return (
    <div className="mx-auto max-w-[95%] space-y-8 p-6">

      {/* Wallet Balance */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-white">
          <div className="space-y-2 flex-1">
            <p className="text-lg font-semibold text-[#E59D2C]">
              Current Wallet Balance
            </p>

            {balance === null ? (
              <div className="h-12 w-full max-w-sm rounded-md bg-black/10 animate-pulse" />
            ) : (
              <p className="text-4xl font-extrabold text-[#577C8E]">
                ₱
                {balance.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Updated in real time once transactions post.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl px-6 py-6 md:py-3 border border-[#E59D2C] text-[#E59D2C] hover:bg-gray-50 shadow-sm"
            >
              Change GCash Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">

          <div className="px-8 pt-6 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Platform Wallet Transactions
            </h3>
            <div className="hidden md:block text-sm text-gray-500">
              Showing recent activity
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 items-center px-8 py-3 text-xs md:text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
            <div className="col-span-4 text-left">Reference Code</div>
            <div className="col-span-3 text-left">Type</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">View</div>
          </div>

          {/* Table Rows */}
          <ul className="divide-y">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <li
                  key={i}
                  className="grid grid-cols-12 items-center px-8 py-5 bg-white"
                >
                  <div className="col-span-3 h-5 w-32 rounded bg-black/10" />
                  <div className="col-span-3 h-5 w-24 rounded bg-black/10" />
                  <div className="col-span-3 h-5 w-20 rounded bg-black/10 ml-auto" />
                  <div className="col-span-3 h-5 w-24 rounded bg-black/10 ml-auto" />
                </li>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => {
                const ref = tx.reference_code ?? tx.transactions?.reference_code ?? "—";
                const stat = tx.status ?? tx.transactions?.status ?? "—";

                return (
                  <li
                    key={tx.id}
                    className="grid grid-cols-12 items-center px-8 py-4 bg-white hover:bg-gray-50"
                  >

                    {/* Reference Code */}
                    <div className="col-span-4 text-sm text-gray-700 truncate text-left">
                      {ref}
                    </div>

                    {/* Type */}
                    <div className="col-span-3 text-sm text-gray-600 capitalize text-left">
                      {tx.type}
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right text-gray-800 font-medium">
                      ₱
                      {tx.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          stat === "Completed"
                            ? "bg-green-100 text-green-700"
                            : stat === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : stat === "Paid"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {stat}
                      </span>
                    </div>

                    {/* View Button */}
                    <div className="col-span-1 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-100 rounded-full"
                        onClick={() => {
                          setSelectedTx(tx);
                          setSheetOpen(true);
                        }}
                      >
                        <SquareArrowOutUpRight className="h-4 w-4 text-gray-700" />
                      </Button>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-8 py-6 text-center text-gray-500">
                No transactions found.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <WalletTransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tx={selectedTx}
      />

    </div>
  );
}
