// hooks/queries/useTransactions.ts
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

export type TxStatus = "active" | "completed" | "cancelled";
export type TxType = "Sales" | "Purchases";
export type TxMethod = "Meetup" | "Delivery";

export interface Tx {
  id: string;
  transaction_id: string;
  reference_code?: string;
  status: "active" | "completed" | "cancelled";
  type: "Sales" | "Purchases";
  method: "Meetup" | "Delivery";
  payment_method: "Cash on Hand" | "Online Payment";
  title: string;
  price: number;
  total?: number;
  post_id: string;
  buyer: string;
  seller: string;
  buyer_id: string;
  seller_id: string;
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
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  const query = useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => fetchTransactions(userId),
    enabled: !!userId,
  });

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`transactions_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          // Invalidate and refetch transactions when any transaction is updated
          queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return query;
}
