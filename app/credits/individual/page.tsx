"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function IndividualCreditsPage() {
  const packages = [
    {
      id: 1,
      title: "Individual",
      price: "₱5",
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
      price: "₱45",
      description: "Most popular choice for regular users who post consistently",
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
      price: "₱85",
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

  const faqs = [
    {
      q: "What are posting credits?",
      a: "Posting credits allow you to post items for sale, rent, trade, emergency lending, or pasabuy on our platform. Each credit equals one listing, regardless of the type.",
    },
    {
      q: "How many free posting credits do I get?",
      a: "Normal users receive 3 free posting credits every month, while businesses and organizations receive 5 free credits monthly. These can be used for any type of listing.",
    },
    {
      q: "Do unused free credits roll over to the next month?",
      a: "No, unused free posting credits do not carry over. If you don’t use your free credits within the month, they will be removed and not added to the next month’s credits.",
    },
    {
      q: "Do purchased credits expire?",
      a: "Yes, purchased posting credits expire 30 days after purchase. Make sure to use them within this timeframe.",
    },
    {
      q: "Can I get a refund for unused credits?",
      a: "Strictly no refunds are issued for purchased credits. However, they remain in your account until used.",
    },
    {
      q: "How can I buy more posting credits?",
      a: "Normal users can purchase additional credits at ₱5 each (maximum 20 per month) with volume discounts available. Businesses and organizations can purchase credits at ₱10 each with the same discount structure.",
    },
    {
      q: "Are donation listings counted toward credits?",
      a: "No, donation listings are completely free and unlimited. They do not consume any of your posting credits.",
    },
    {
      q: "What happens if I run out of credits?",
      a: "You won’t be able to post new items unless you wait for the next month’s free credits or purchase more credits.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Back button aligned left */}
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

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-2 text-center">Buy Posting Credits</h1>
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
              {/* Title with inline Recommended */}
              <h2 className="text-lg font-semibold mb-2">
                {pkg.title}{" "}
                {pkg.recommended && (
                  <span className="text-sm font-medium text-red-500 align-baseline">
                    (Recommended)
                  </span>
                )}
              </h2>

              {/* Price */}
              <p className="text-3xl font-extrabold text-[#577C8E] mb-2">
                {pkg.price}
              </p>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4">{pkg.description}</p>

              {/* Features */}
              <ul className="text-sm space-y-2 mb-6">
                {pkg.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              {/* Purchase Button with hover */}
              <Button
                variant="outline"
                className="w-full bg-white hover:bg-[#E59E2C] hover:text-white transition-colors rounded-md"
                onClick={() => alert(`Selected package: ${pkg.title}`)}
              >
                Purchase
              </Button>
            </div>
          ))}
        </div>

        {/* Free posts info */}
        <div className="mt-10 border border-gray-300 rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-500">❤ Earn Free Posts</p>
          <p className="text-sm text-muted-foreground">
            Get 1 bonus post for each transaction completed through our secure escrow
            system – encouraging safe trading while rewarding platform participation.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-10 border border-gray-300 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index}>
                <p className="font-medium">{faq.q}</p>
                <p className="text-sm text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
