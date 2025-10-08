"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useConfirmReceived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await fetch("/api/transactions/confirm-received", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm receipt");
      return data;
    },
    onMutate: () => toast.loading("Updating transaction..."),
    onSuccess: () => {
      toast.success("Item marked as received!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => toast.error(err.message),
    onSettled: () => toast.dismiss(),
  });
}
