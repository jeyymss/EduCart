"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CashInSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  const userId = params.get("user_id");
  const amount = params.get("amount");
  const reference_code = params.get("ref");

  useEffect(() => {
    async function finalize() {
      await fetch("/api/wallet/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, reference_code }),
      });

      router.replace("/wallet");
    }

    if (userId && amount && reference_code) finalize();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
      <p>Updating your wallet...</p>
    </div>
  );
}
