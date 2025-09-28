"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCurrentOrganization } from "@/hooks/queries/useCurrentOrg";
import { Button } from "@/components/ui/button";
import EditProfile from "@/components/profile/EditProfile";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsPanel } from "@/components/profile/SettingsPanel";

/* Calendar + Cards */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Ticket, BarChart2, CircleDollarSign } from "lucide-react";

const AVATAR_DIM = 128;
const KPI_NUMBER_COLOR = "#577C8E";

export default function OrganizationDashboard() {
  const { data: org, isLoading, error } = useCurrentOrganization();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveTab(hash);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  if (isLoading) return <div>Loading organization…</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!org) return <div>No organization profile found.</div>;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* --- Header Section --- */}
      <div className="pb-8">
        {isEditing ? (
          <EditProfile
            role="organization"
            userId={org.user_id}
            currentAvatar={org.avatar_url}
            currentBackground={org.background_url}
            currentBio={org.bio}
            onDone={(updated) => {
              setIsEditing(false);
              if (updated) {
                org.avatar_url = updated.avatar_url ?? org.avatar_url;
                org.background_url = updated.background_url ?? org.background_url;
                org.bio = updated.bio ?? org.bio;
              }
            }}
          />
        ) : (
          <div className="relative w-full">
            {/* Cover / background */}
            <div className="relative w-full h-60 md:h-80 lg:h-96 overflow-hidden">
              <Image
                src={org.background_url ?? "/placeholder-bg.jpg"}
                alt="Background"
                fill
                className="object-cover"
                priority
              />
              {/* Edit Profile button */}
              <div className="absolute top-10 right-4 flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FFFFFF] text-black hover:bg-[#E59E2C]"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Avatar + Info Card */}
            <div className="bg-white shadow-sm px-6 pb-6">
              <div className="flex items-start gap-4">
                <div
                  className="relative -mt-16 rounded-full ring-4 ring-white shadow-md overflow-hidden shrink-0"
                  style={{ width: AVATAR_DIM, height: AVATAR_DIM }}
                >
                  <Image
                    src={org.avatar_url ?? "/placeholder-avatar.png"}
                    alt={org.organization_name}
                    width={AVATAR_DIM}
                    height={AVATAR_DIM}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex-1 mt-2">
                  <h1 className="text-2xl font-bold">{org.organization_name}</h1>
                  <p className="text-base text-muted-foreground">
                    {org.bio ?? "This organization has no bio yet."}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {org.role ?? "Organization"}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {org.verification_status ?? "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar + Right Column (KPIs + Notifications) */}
            <div className="px-6 mt-4">
              <div className="grid gap-6 lg:grid-cols-4 items-stretch">
                {/* Calendar (left) */}
                <Card className="rounded-xl shadow-sm lg:col-span-1">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-slate-800">
                      Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      captionLayout="dropdown"
                      className="rounded-md border shadow-sm w-full"
                    />
                  </CardContent>
                </Card>

                {/* Right column: KPIs on top + Notifications filling the rest */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                  {/* KPI row */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <KPI
                      title="Post Credits"
                      value={String(org.post_credits_balance ?? 0)}
                      icon={<Ticket className="h-7 w-7" />}
                    />
                    <KPI
                      title="Subscription Used"
                      value={String(org.subscription_quota_used ?? 0)}
                      icon={<BarChart2 className="h-7 w-7" />}
                    />
                    <KPI
                      title="Total Earnings"
                      value={`₱${Number(org.total_earnings ?? 0).toLocaleString()}`}
                      icon={<CircleDollarSign className="h-7 w-7" />}
                    />
                  </div>

                  {/* NEW: Notifications (fills remaining height to align with calendar) */}
                  <Card className="rounded-xl shadow-sm flex-1 min-h-[140px]">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium text-slate-800">
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-500">
                      No notifications yet.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Content (tabs) --- */}
      <div className="flex-1 px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="overview">
            <div className="px-6 mt-4 text-xs text-muted-foreground">
              Created: {new Date(org.created_at).toLocaleString()}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Transactions</h2>
              <p>Transactions here</p>
            </section>
          </TabsContent>

          <TabsContent value="reviews">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Reviews</h2>
              <p>Customer reviews here.</p>
            </section>
          </TabsContent>

          <TabsContent value="settings">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              <SettingsPanel />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function KPI({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl shadow-sm w-full h-auto">
      {/* Compact header */}
      <CardHeader className="px-4 pt-2 pb-1">
        <CardTitle className="text-sm font-medium text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>

      {/* Icon + Number directly below title */}
      <CardContent className="px-4 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="shrink-0" style={{ color: KPI_NUMBER_COLOR }}>
            {icon}
          </div>
          <div
            className="text-2xl font-semibold leading-tight"
            style={{ color: KPI_NUMBER_COLOR }}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}