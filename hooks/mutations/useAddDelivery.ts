"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      courierId,
    }: {
      transactionId: string;
      courierId: string;
    }) => {
      const res = await fetch("/api/transactions/add-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, courierId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign courier");
      return data;
    },
    onMutate: () => toast.loading("Assigning courier..."),
    onSuccess: () => {
      toast.success("Courier assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add delivery"),
    onSettled: () => toast.dismiss(),
  });
}
