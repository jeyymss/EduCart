"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function IndividualCreditsPage() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user email from session
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) setUserEmail(session.user.email);
    };
    getSession();
  }, [supabase]);

  // Packages
  const packages = [
    {
      id: 1,
      title: "Individual",
      price: 5,
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
      price: 45,
      credits: 10,
      description:
        "Most popular choice for regular users who post consistently",
      features: [
        "10 additional posts per month",
        "10% savings vs individual posts",
        "Valid for 30 days",
        "All platform features included",
      ],
      bg: "#C7D9E5",
    },
    {
      id: 3,
      title: "20 Additional Posts",
      price: 85,
      credits: 20,
      description: "Maximum value for power users who post frequently",
      features: [
        "20 additional posts per month",
        "15% savings vs individual posts",
        "Valid for 30 days",
        "All platform features included",
      ],
      bg: "#FFF1D0",
    },
  ];

  // 💳 Handle PayMongo Purchase Flow
  const handlePurchase = async (pkg: {
    id: number;
    title: string;
    price: number;
    credits: number;
  }) => {
    if (!userEmail) {
      alert("You must be logged in to purchase credits.");
      return;
    }

    try {
      setLoadingId(pkg.id);

      // 1️⃣ Create Payment Intent
      const intentRes = await fetch("/api/paymongo/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pkg.price,
          description: `EduCart - ${pkg.title}`,
          email: userEmail,
        }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok || !intentData?.data?.id) {
        console.error("Intent error:", intentData);
        alert("Failed to create payment intent.");
        return;
      }
      const intentId = intentData.data.id;

      // 2️⃣ Create Payment Method
      const methodRes = await fetch("/api/paymongo/create-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "EduCart User",
          email: userEmail,
        }),
      });
      const methodData = await methodRes.json();
      if (!methodRes.ok || !methodData?.data?.id) {
        console.error("Method error:", methodData);
        alert("Failed to create payment method.");
        return;
      }
      const paymentMethodId = methodData.data.id;

      // 3️⃣ Attach & redirect
      const attachRes = await fetch("/api/paymongo/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentId, paymentMethodId }),
      });
      const attachData = await attachRes.json();
      if (
        !attachRes.ok ||
        !attachData?.data?.attributes?.next_action?.redirect?.url
      ) {
        console.error("Attach error:", attachData);
        alert("Failed to attach payment method.");
        return;
      }

      // 🚀 Redirect to GCash checkout
      const checkoutUrl = attachData.data.attributes.next_action.redirect.url;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong during payment.");
    } finally {
      setLoadingId(null);
    }
  };

  // 💬 FAQs
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="max-w-7xl mx-auto flex">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-[#577C8E] hover:text-[#577C8E] hover:bg-[#577C8E]/10 mt-5"
            asChild
          >
            <Link href="/profile#settings">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Buy Posting Credits
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Purchase credits to list your items for sale on EduCart
        </p>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl border border-gray-300 p-6 shadow-sm"
              style={{ backgroundColor: pkg.bg }}
            >
              <h2 className="text-lg font-semibold mb-2">
                {pkg.title}{" "}
                {pkg.recommended && (
                  <span className="text-sm font-medium text-red-500">
                    (Recommended)
                  </span>
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
                variant="outline"
                className="w-full bg-white hover:bg-[#E59E2C] hover:text-white transition-colors rounded-md"
                disabled={loadingId === pkg.id}
                onClick={() => handlePurchase(pkg)}
              >
                {loadingId === pkg.id ? "Processing..." : "Purchase"}
              </Button>
            </div>
          ))}
        </div>

        {/* Bonus Section */}
        <div className="mt-10 border border-gray-300 rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-500">❤ Earn Free Posts</p>
          <p className="text-sm text-muted-foreground">
            Get 1 bonus post for each transaction completed through our secure
            escrow system – encouraging safe trading while rewarding platform
            participation.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border space-y-6">
            <h2 className="text-lg font-semibold">
              Frequently Asked Questions
            </h2>
            {faqs.map((item, i) => (
              <div key={i}>
                <h3 className="font-medium">{item.q}</h3>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
