"use client";

import {
  BadgeCheck,
  Calendar,
  AlarmCheck,
  Star,
  ShoppingBag,
  Rocket,
  CheckCircle,
} from "lucide-react";

const features = [
  { icon: <BadgeCheck size={35} />, label: "University Verified" },
  { icon: <Calendar size={35} />, label: "Rental Scheduling" },
  { icon: <AlarmCheck size={35} />, label: "Emergency Lending" },
  { icon: <Star size={35} />, label: "Peer Reviews" },
  { icon: <ShoppingBag size={35} />, label: "PasaBuy" },
  { icon: <Rocket size={35} />, label: "Boost Visibility" },
  { icon: <CheckCircle size={35} />, label: "Admin Moderation" },
];

export default function FeatureList() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 py-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2 text-[#0f172a]">
          <div className="flex flex-col items-center text-center text-sm">
            <div className="mb-1">{feature.icon}</div>
            <span className="text-xs text-[#333333] md:text-lg lg:text-xl font-medium whitespace-nowrap">
              {feature.label}
            </span>
          </div>
          {index < features.length - 1 && (
            <span className="text-gray-400 mx-2 select-none hidden sm:inline">
              |
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
