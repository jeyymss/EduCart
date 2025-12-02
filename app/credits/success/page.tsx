"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreditSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");

  useEffect(() => {
    const email = searchParams.get("email");
    const credits = Number(searchParams.get("credits"));
    const amount = Number(searchParams.get("amount"));

    if (!email || !credits || !amount) {
      setStatus("error");
      return;
    }

    const applyCredits = async () => {
      try {
        const res = await fetch("/api/credits/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, credits, amount }),
        });

        if (!res.ok) {
          setStatus("error");
        } else {
          setStatus("ok");
        }
      } catch (err) {
        console.error("credits/complete error", err);
        setStatus("error");
      }
    };

    applyCredits();
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      {status === "pending" && (
        <>
          <h1 className="text-xl font-semibold text-slate-800">
            Finalizing your purchase…
          </h1>
          <p className="text-sm text-slate-500">
            Please wait while we add your posting credits.
          </p>
        </>
      )}

      {status === "ok" && (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            Payment successful!
          </h1>
          <p className="text-sm text-slate-600">
            Your posting credits have been added to your account.
          </p>
          <Button onClick={() => router.push("/profile#settings")}>
            Go back to Profile
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold text-red-600">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600">
            We couldn’t finalize your credit purchase. If your payment went
            through, please contact support.
          </p>
          <Button onClick={() => router.push("/credits/individual")}>
            Back to Credits
          </Button>
        </>
      )}
    </div>
  );
}
