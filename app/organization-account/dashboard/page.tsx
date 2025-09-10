"use client";

import Image from "next/image";
import { useCurrentOrganization } from "@/hooks/queries/useCurrentOrg";

export default function OrganizationDashboard() {
  const { data: org, isLoading, error } = useCurrentOrganization();

  if (isLoading) return <div>Loading organization…</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!org) return <div>No organization profile found.</div>;

  return (
    <div className="space-y-6">
      {org.background_url && (
        <div className="relative h-40 w-full overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={org.background_url}
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        {org.avatar_url ? (
          <Image
            src={org.avatar_url}
            alt={org.organization_name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{org.organization_name}</h1>
          <p className="text-sm text-muted-foreground">
            {org.role} • {org.verification_status}
          </p>
        </div>
      </div>

      {org.organization_description && (
        <p className="text-sm leading-6">{org.organization_description}</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Post Credits" value={org.post_credits_balance} />
        <Stat label="Subscription Used" value={org.subscription_quota_used} />
        <Stat
          label="Total Earnings"
          value={`₱${Number(org.total_earnings).toLocaleString()}`}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Created: {new Date(org.created_at).toLocaleString()}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
