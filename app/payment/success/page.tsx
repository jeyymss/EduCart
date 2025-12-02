"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();

  const txnId = params.get("txn");
  const convId = params.get("conv");

  useEffect(() => {
    const confirm = async () => {
      await fetch("/api/payments/confirm", {
        method: "POST",
        body: JSON.stringify({ txnId }),
      });

      router.replace(`/messages/${convId}?paid=true`);
    };

    if (txnId && convId) confirm();
  }, [txnId, convId]);

  return (
    <p className="p-6 text-center text-lg font-medium">
      Processing payment...
    </p>
  );
}
