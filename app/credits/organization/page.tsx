"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import CreditPaymentDialog from "@/components/credits/CreditPurchaseDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationCreditsPage() {
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // ✅ NEW
  const [walletBalance, setWalletBalance] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load session + wallet balance
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user?.email) setUserEmail(session.user.email);
      if (session?.user?.id) setUserId(session.user.id); // ✅ store userId

      const id = session?.user?.id;

      if (id) {
        const { data: w } = await supabase
          .from("wallets")
          .select("current_balance")
          .eq("user_id", id)
          .single();

        if (w?.current_balance != null) setWalletBalance(w.current_balance);
      }
    };

    loadUser();
  }, []);

  // =======================
  // WALLET PAYMENT FOR CREDITS
  // =======================
  const handleWalletPayment = async () => {
    if (!selectedPkg || !userId) return;

    setIsProcessing(true);

    const res = await fetch("/api/credits/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, 
        credits: selectedPkg.credits,
        price: selectedPkg.price, 
      }),
    });

    const json = await res.json();
    setIsProcessing(false);

    if (json.error) {
      setErrorMessage(json.error);
      setErrorDialogOpen(true);
      return;
    }

    // Reload wallet balance
    if (userId) {
      const { data: w } = await supabase
        .from("wallets")
        .select("current_balance")
        .eq("user_id", userId)
        .single();

      if (w?.current_balance != null) setWalletBalance(w.current_balance);
    }

    setDialogOpen(false);
    setSuccessDialogOpen(true);
  };

  // =======================
  // GCASH PAYMENT FOR CREDITS
  // =======================
  const handleGCashPayment = async () => {
    if (!selectedPkg || !userEmail) return;

    setIsProcessing(true);

    const res = await fetch("/api/credits/gcash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: selectedPkg.price,
        credits: selectedPkg.credits,
        email: userEmail,
      }),
    });

    const json = await res.json();
    setIsProcessing(false);

    if (json.checkout_url) {
      window.location.href = json.checkout_url;
    } else {
      setErrorMessage("Failed to initialize GCash payment. Please try again.");
      setErrorDialogOpen(true);
    }
  };

  // Packages
  const packages = [
    {
      id: 1,
      title: "Individual",
      price: 10,
      credits: 1,
      description: "Perfect for occasional posting needs",
      features: [
        "Pay per post as needed",
        "Up to 20 posts per month",
        "All platform transactions included",
        "No commitment required",
      ],
      bg: "#FFF1D0",
    },
    {
      id: 2,
      title: "10 Additional Posts",
      recommended: true,
      price: 90,
      credits: 10,
      description: "Most popular choice among regular users",
      features: [
        "10 additional posts per month",
        "10% savings",
        "Valid for 30 days",
        "All features included",
      ],
      bg: "#C7D9E5",
    },
    {
      id: 3,
      title: "20 Additional Posts",
      price: 170,
      credits: 20,
      description: "Max value for frequent posters",
      features: [
        "20 additional posts",
        "15% savings",
        "Valid for 30 days",
        "All features included",
      ],
      bg: "#FFF1D0",
    },
  ];

  const faqs = [
    {
      q: "What are posting credits?",
      a: "Posting credits allow you to post items for sale, rent, trade, emergency lending, or pasabuy on our platform. Each credit equals one listing, regardless of the type.",
    },
    {
      q: "How many free posting credits do I get?",
      a: "Normal users receive 3 free posting credits every month, while businesses and organizations receive 5 free credits monthly.",
    },
    {
      q: "Do unused free credits roll over to the next month?",
      a: "No, unused free posting credits do not carry over to the next month.",
    },
    {
      q: "Do purchased credits expire?",
      a: "Yes, purchased credits expire 30 days after purchase. Make sure to use them within this timeframe.",
    },
    {
      q: "Can I get a refund for unused credits?",
      a: "Strictly no refunds are issued for purchased credits. However, they remain in your account until used.",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-[#577C8E]"
            asChild
          >
            <Link href="/profile#settings">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            Buy Posting Credits
          </h1>

          <p className="text-center text-sm text-gray-600 mb-8">
            Purchase credits to list your items on EduCart
          </p>

          {/* PACKAGES */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl border p-6 shadow-sm flex flex-col"
                style={{ backgroundColor: pkg.bg }}
              >
                <h2 className="text-lg font-semibold mb-2">
                  {pkg.title}{" "}
                  {pkg.recommended && (
                    <span className="text-xs text-red-500">(Recommended)</span>
                  )}
                </h2>

                <p className="text-3xl font-extrabold text-[#577C8E] mb-2">
                  ₱{pkg.price}
                </p>

                <p className="text-sm text-gray-700 mb-4">{pkg.description}</p>

                <ul className="text-sm space-y-2 mb-6">
                  {pkg.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>

                <Button
                  className="mt-auto bg-[#E59E2C] border hover:bg-white hover:text-black hover:cursor-pointer"
                  onClick={() => {
                    setSelectedPkg(pkg);
                    setDialogOpen(true);
                  }}
                >
                  Purchase
                </Button>
              </div>
            ))}
          </div>

          {/* BONUS */}
          <div className="mt-8 border rounded-2xl p-6 bg-white shadow-sm">
            <p className="text-red-500 font-medium text-sm">❤ Earn Free Posts</p>
            <p className="text-sm text-gray-600 mt-1">
              Get 1 bonus post for every completed escrow transaction.
            </p>
          </div>

          {/* FAQs */}
          <div className="mt-10">
            <div className="bg-white border shadow-sm rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
              {faqs.map((item, i) => (
                <div key={i}>
                  <h3 className="font-medium text-sm">{item.q}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT DIALOG */}
          {selectedPkg && (
            <CreditPaymentDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              pkgTitle={selectedPkg.title}
              pkgPrice={selectedPkg.price}
              pkgCredits={selectedPkg.credits}
              balance={walletBalance}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isProcessing={isProcessing}
              onWalletPay={handleWalletPayment}
              onGCashPay={handleGCashPayment}
            />
          )}

          {/* SUCCESS DIALOG */}
          <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Purchase Successful!
                  </DialogTitle>
                  <DialogDescription className="text-center text-base">
                    {selectedPkg && (
                      <>
                        <span className="font-semibold text-green-600">
                          {selectedPkg.credits} posting credit{selectedPkg.credits > 1 ? 's' : ''}
                        </span>{" "}
                        {selectedPkg.credits > 1 ? 'have' : 'has'} been added to your account.
                      </>
                    )}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setSuccessDialogOpen(false)}
                  className="w-full bg-[#E59E2C] hover:bg-[#d18e1f]"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccessDialogOpen(false);
                    window.location.href = "/profile#settings";
                  }}
                  className="w-full"
                >
                  View Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ERROR DIALOG */}
          <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center text-red-600">
                    Payment Failed
                  </DialogTitle>
                  <DialogDescription className="text-center text-base">
                    {errorMessage}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setErrorDialogOpen(false)}
                  className="w-full bg-[#E59E2C] hover:bg-[#d18e1f]"
                >
                  Try Again
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
