"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX, Wallet } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type PaymentLog = {
  id: number;
  email: string;
  description: string;
  amount: number;
  created_at: string;
};

export default function WalletPage() {
  const supabase = createClient();

  const [earnings, setEarnings] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch total earnings from PayMongo API route
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("/api/admin/paymongo/earnings");
        const data = await res.json();
        if (res.ok) setEarnings(data.totalEarnings);
      } catch (err) {
        console.error("Error fetching PayMongo data:", err);
      }
    };
    fetchEarnings();
  }, []);

  // 🧩 Fetch payment_logs from Supabase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("payment_logs")
          .select("id, email, description, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(15);

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching payment logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();

    // 🧨 Realtime Subscription for new payments
    const channel = supabase
      .channel("realtime-payment-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "payment_logs" },
        (payload) => {
          console.log("💸 New Payment Received:", payload.new);

          const newTx = payload.new as PaymentLog;

          setTransactions((prev) => [newTx, ...prev.slice(0, 14)]); // keep top 15
          setEarnings((prev) => (prev ?? 0) + newTx.amount);
        }
      )
      .subscribe();

    // Cleanup when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="mx-auto max-w-[95%] space-y-8 p-6">
      {/* Wallet Balance */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-white">
          <div className="space-y-2 flex-1">
            <p className="text-lg font-semibold text-[#E59D2C]">
              Current Wallet Balance
            </p>

            {/* Display Total Earnings */}
            {earnings === null ? (
              <div className="h-12 w-full max-w-sm rounded-md bg-black/10 animate-pulse" />
            ) : (
              <p className="text-4xl font-extrabold text-[#577C8E]">
                ₱
                {earnings.toLocaleString("en-PH", {
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Invoices Paid
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs px-2 py-1">
                <FileCheck className="h-4 w-4" />
                Cleared
              </span>
            </div>
            <div className="mt-3 h-8 w-48 rounded-md bg-black/10" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Invoices Unpaid
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 text-xs px-2 py-1">
                <FileX className="h-4 w-4" />
                Outstanding
              </span>
            </div>
            <div className="mt-3 h-8 w-48 rounded-md bg-black/10" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Earnings
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs px-2 py-1">
                <Wallet className="h-4 w-4" />
                Your share
              </span>
            </div>
            <div className="mt-3 h-8 w-32 rounded-md bg-black/10" />
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="px-8 pt-6 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Transaction Details
            </h3>
            <div className="hidden md:block text-sm text-gray-500">
              Showing recent activity
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 items-center px-8 py-3 text-xs md:text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
            <div className="col-span-4 md:col-span-3">User Name</div>
            <div className="col-span-6 md:col-span-5">Description</div>
            <div className="col-span-2 md:col-span-2 text-right">Price</div>
            <div className="col-span-12 md:col-span-2 md:text-right">
              Status
            </div>
          </div>

          {/* Table Rows */}
          <ul className="divide-y">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <li
                  key={i}
                  className="grid grid-cols-12 items-center px-8 py-5 bg-white hover:bg-gray-50 transition"
                >
                  <div className="col-span-4 md:col-span-3">
                    <div className="h-5 w-full max-w-[200px] rounded bg-black/10" />
                  </div>
                  <div className="col-span-6 md:col-span-5">
                    <div className="h-5 w-full max-w-[320px] rounded bg-black/10" />
                  </div>
                  <div className="col-span-2 md:col-span-2 flex justify-end">
                    <div className="h-5 w-full max-w-[100px] rounded bg-black/10" />
                  </div>
                  <div className="col-span-12 md:col-span-2 md:flex md:justify-end mt-3 md:mt-0">
                    <div className="h-6 w-full max-w-[120px] rounded-full bg-black/10" />
                  </div>
                </li>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="grid grid-cols-12 items-center px-8 py-4 bg-white hover:bg-gray-50 transition"
                >
                  <div className="col-span-4 md:col-span-3 text-gray-700 text-sm truncate">
                    {tx.email}
                  </div>
                  <div className="col-span-6 md:col-span-5 text-gray-600 text-sm truncate">
                    {tx.description}
                  </div>
                  <div className="col-span-2 md:col-span-2 text-right font-medium text-gray-800">
                    ₱
                    {tx.amount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="col-span-12 md:col-span-2 md:text-right mt-2 md:mt-0">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Success
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-8 py-6 text-center text-gray-500">
                No transactions found.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
