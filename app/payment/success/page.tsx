"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("✅ Payment Successful!", {
      description:
        "Your posting credits have been added to your EduCart account.",
      duration: 5000,
    });

    // Remove any PayMongo query params so it won’t repeat the toast
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, document.title, url.toString());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-bold text-[#577C8E] mb-2">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-600 max-w-sm mb-6">
        Your payment was processed successfully. You can now use your new
        posting credits to list more items on EduCart.
      </p>

      <div className="flex gap-3">
        <Button
          className="bg-[#577C8E] text-white hover:bg-[#476875]"
          onClick={() => router.push("/profile")}
        >
          Go to Profile
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
