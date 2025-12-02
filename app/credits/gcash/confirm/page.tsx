"use client";

import { useEffect } from "react";

export default function ConfirmCredits() {
  useEffect(() => {
    async function finalizePayment() {
      const params = new URLSearchParams(window.location.search);

      const email = params.get("email");
      const credits = Number(params.get("credits"));
      const amount = Number(params.get("amount"));

      if (!email || !credits || !amount) return;

      await fetch("/api/credits/complete", {
        method: "POST",
        body: JSON.stringify({ email, credits, amount }),
      });

      window.location.href = "/credits/individuals?paid=true";
    }

    finalizePayment();
  }, []);

  return <p className="p-6 text-center">Verifying payment...</p>;
}
