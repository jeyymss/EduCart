"use client";

import { UserPlus, Search, MessageSquare, Calendar, Coins } from "lucide-react"; // or any icon library

const steps = [
  {
    icon: <UserPlus size={24} />,
    title: "Sign Up with University Email",
    description:
      "Create an account with your university email, or any valid email if you're an alumnus.",
  },
  {
    icon: <Search size={24} />,
    title: "Browse or List Items",
    description:
      "Search for what you need or list items you want to sell, rent, trade or donate.",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Connect & Negotiate",
    description: "Chat with sellers, make offers, and agree on terms.",
  },
  {
    icon: <Calendar size={24} />,
    title: "Schedule Exchange",
    description: "Set up a meeting point on campus or arrange delivery.",
  },
  {
    icon: <Coins size={24} />,
    title: "Complete Transaction",
    description: "Exchange items and complete the transaction safely.",
  },
];

export default function TransactionSteps() {
  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-8 text-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div className="bg-[#0f2d48] text-white p-4 rounded-full">
              {step.icon}
            </div>
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="text-xs text-gray-600 max-w-[200px]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
