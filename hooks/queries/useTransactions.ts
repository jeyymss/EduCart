// hooks/queries/useTransactions.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export type TxStatus = "active" | "completed" | "cancelled";
export type TxType = "Sales" | "Purchases";
export type TxMethod = "Meetup" | "Delivery";

export interface Tx {
  id: string;
  reference_code?: string;
  status: "active" | "completed" | "cancelled";
  type: "Sales" | "Purchases";
  method: "Meetup" | "Delivery";
  title: string;
  price: number;
  total?: number;
  created_at: string;
  post_type?: string;
  image_url?: string;
}

async function fetchTransactions(userId: string): Promise<Tx[]> {
  const res = await fetch(`/api/transactions?userId=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
  return data.transactions;
}

export function useTransactions(userId: string) {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => fetchTransactions(userId),
    enabled: !!userId,
  });
}
