"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function BusinessCreditsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Basic" | "Premium">("Basic");

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* TOP NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm h-14">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6">
          <div className="h-full flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-[#577C8E] hover:text-[#577C8E] hover:bg-[#577C8E]/10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="xs:inline">Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="h-14" />

      {/* HEADER TEXT */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-xl sm:text-2xl font-bold">Buy Posting Credits</h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Pick a posting package that fits your business or organization needs
        </p>
      </div>

      {/* TABS */}
      <div className="flex justify-center mb-6 px-4">
        <div className="flex space-x-8 border-b w-full max-w-xs justify-center">
          <button
            onClick={() => setActiveTab("Basic")}
            className={`pb-2 text-sm sm:text-base font-medium ${
              activeTab === "Basic"
                ? "text-[#577C8E] border-b-2 border-[#577C8E]"
                : "text-gray-600 hover:text-[#577C8E]"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab("Premium")}
            className={`pb-2 text-sm sm:text-base font-medium ${
              activeTab === "Premium"
                ? "text-[#577C8E] border-b-2 border-[#577C8E]"
                : "text-gray-600 hover:text-[#577C8E]"
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* BASIC PLANS */}
      {activeTab === "Basic" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          {/* Individual */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6 bg-[#FFF1D0] flex flex-col">
            <h3 className="font-semibold text-lg">Individual</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#577C8E] mt-2">
              ₱10
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Perfect for occasional business posting needs
            </p>
            <ul className="text-sm text-gray-700 mt-4 space-y-2">
              <li>✓ Pay per post as needed</li>
              <li>✓ Up to 20 posts per month</li>
              <li>✓ All platform transactions included</li>
              <li>✓ No commitment required</li>
            </ul>
            <Button className="mt-6 bg-white text-black border hover:bg-[#577C8E] hover:text-white">
              Purchase
            </Button>
          </div>

          {/* 10 Additional */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6 bg-[#C7D9E5] flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">10 Additional Posts</h3>
              <span className="text-xs font-medium text-red-500">
                (Recommended)
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#577C8E] mt-2">
              ₱90
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Most popular choice for active businesses posting regularly
            </p>
            <ul className="text-sm text-gray-700 mt-4 space-y-2">
              <li>✓ 10 additional posts per month</li>
              <li>✓ 10% savings vs individual posts</li>
              <li>✓ Valid for 30 days</li>
              <li>✓ All platform features included</li>
            </ul>
            <Button className="mt-6 bg-white text-black border hover:bg-[#577C8E] hover:text-white">
              Purchase
            </Button>
          </div>

          {/* 20 Additional */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6 bg-[#FFF1D0] flex flex-col">
            <h3 className="font-semibold text-lg">20 Additional Posts</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#577C8E] mt-2">
              ₱170
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Great value for businesses with high posting volume
            </p>
            <ul className="text-sm text-gray-700 mt-4 space-y-2">
              <li>✓ 20 additional posts per month</li>
              <li>✓ 15% savings vs individual posts</li>
              <li>✓ Valid for 30 days</li>
              <li>✓ All platform features included</li>
            </ul>
            <Button className="mt-6 bg-white text-black border hover:bg-[#577C8E] hover:text-white">
              Purchase
            </Button>
          </div>
        </div>
      )}

      {/* PREMIUM PLANS */}
      {activeTab === "Premium" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          {/* Monthly */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6 bg-[#FFF1D0] flex flex-col">
            <h3 className="font-semibold text-lg">Premium Monthly</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#577C8E] mt-2">
              ₱149
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Complete monthly solution for active businesses and organizations
            </p>
            <ul className="text-sm text-gray-700 mt-4 space-y-2">
              <li>✓ Unlimited postings</li>
              <li>✓ Scheduled listings</li>
              <li>✓ Boost functionality for top search results</li>
            </ul>
            <Button className="mt-6 bg-white text-black border hover:bg-[#577C8E] hover:text-white">
              Purchase
            </Button>
          </div>

          {/* Semester */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6 bg-[#C7D9E5] flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Premium Semester</h3>
              <span className="text-xs font-medium text-red-500">
                (Recommended)
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#577C8E] mt-2">
              ₱499
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Long-term value for committed businesses and organizations
            </p>
            <ul className="text-sm text-gray-700 mt-4 space-y-2">
              <li>✓ Unlimited postings for 6 months</li>
              <li>✓ Scheduled listings</li>
              <li>✓ Boost functionality for top search results</li>
              <li>✓ Save ₱395 vs monthly billing</li>
            </ul>
            <Button className="mt-6 bg-white text-black border hover:bg-[#577C8E] hover:text-white">
              Purchase
            </Button>
          </div>
        </div>
      )}

      {/* FREE POSTS BOX */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-red-500 font-medium">❤️ Earn Free Posts</p>
          <p className="text-sm text-gray-600 mt-1">
            Businesses and organizations earn 1 bonus post per escrow
            transaction.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>

          <div>
            <h3 className="font-medium">What are posting credits?</h3>
            <p className="text-sm text-gray-600">
              Posting credits allow businesses and organizations to post items
              on EduCart.
            </p>
          </div>

          <div>
            <h3 className="font-medium">How many free posting credits?</h3>
            <p className="text-sm text-gray-600">
              Businesses and organizations receive 5 free credits monthly.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Do unused credits rollover?</h3>
            <p className="text-sm text-gray-600">
              No, unused free credits do not carry over.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Do purchased credits expire?</h3>
            <p className="text-sm text-gray-600">
              Yes, purchased credits expire after 30 days.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Refunds?</h3>
            <p className="text-sm text-gray-600">
              No refunds, but unused credits remain available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
