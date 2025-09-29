"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

/** Reusable pill action */
function ActionPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[#E59D2C] shadow-sm hover:bg-gray-50 cursor-pointer">
      <span className="font-medium">{label}</span>
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  return (
    <div className="mx-auto max-w-[95%] p-6 space-y-6">
      {/* Page title */}
      <Card className="rounded-2xl border shadow-lg">
        <CardContent className="p-5">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization settings here.
          </p>
        </CardContent>
      </Card>

      {/* Main settings grid */}
      <Card className="rounded-2xl border shadow-lg">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
            {/* Account */}
            <section className="md:col-span-3 space-y-6">
              <h2 className="text-lg font-semibold">Account</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <ActionPill label="Link GCash Account" />
                  <p className="text-sm text-muted-foreground">
                    Connect your GCash wallet for seamless payments and transactions.
                  </p>
                </div>

                <div className="space-y-2">
                  <ActionPill label="Buy Posting Credits" />
                  <p className="text-sm text-muted-foreground">
                    Purchase credits to create posts and boost your content visibility.
                  </p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="md:col-span-4 space-y-4">
              <h2 className="text-lg font-semibold">Security</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current"
                      type={showCurrent ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                      aria-label={showCurrent ? "Hide password" : "Show password"}
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new"
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button className="bg-[#E59D2C] text-black hover:bg-[#d58f1a]">
                    Save Changes
                  </Button>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="md:col-span-3 space-y-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {["Messages", "Comments", "Reviews Received", "Reports", "Transaction Reminders"].map(
                (label) => (
                  <div key={label} className="flex items-center justify-between">
                    <span>{label}</span>
                    <Switch className="data-[state=checked]:bg-[#E59D2C]" />
                  </div>
                )
              )}
            </section>

            {/* Support */}
            <section className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold">Support</h2>
              <div className="space-y-2">
                <ActionPill label="Contact Admin" />
                <p className="text-sm text-muted-foreground">
                  Reach out to administrators for help, technical issues, or account support.
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}