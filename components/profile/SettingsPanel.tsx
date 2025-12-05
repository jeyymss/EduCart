"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";

export function SettingsPanel() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { data: user } = useUserProfile();

  // credits link based on role
  const role = user?.role;
  const creditsLink =
    role === "Business" || role === "organization"
      ? "/credits/bo"
      : "/credits/individual";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Account */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Account</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <a href="#" className="font-medium hover:text-primary">
              Link GCash Account →
            </a>
            <p className="text-xs">
              Connect your GCash wallet for seamless payments and transactions.
            </p>
          </li>
          <li>
            <Link
              href={creditsLink}
              className="font-medium hover:text-primary"
            >
              Buy Posting Credits →
            </Link>
            <p className="text-xs">
              Purchase credits to create posts and boost your content visibility.
            </p>
          </li>
        </ul>
      </section>

      {/* CHANGE PASSWORD */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Security</h3>
        <p className="text-sm text-muted-foreground">Change Password</p>
        <div className="space-y-2">
     
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

        
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            size="sm"
            className="bg-[#E59E2C] text-white hover:bg-[#d4881f]"
          >
            Save Changes
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <div className="flex flex-col space-y-2 text-sm">
          {[
            "Messages",
            "Comments",
            "Reviews Received",
            "Reports",
            "Transaction Reminders",
          ].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span>{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Support</h3>
        <p className="text-sm text-muted-foreground">
          <a href="#" className="font-medium hover:text-primary">
            Contact Admin →
          </a>
          <br />
          Reach out to administrators for help, technical issues, or account
          support.
        </p>
      </section>
    </div>
  );
}
