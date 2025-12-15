"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Users,
  Building2,
  ArrowUpRight,
  Activity,
  Bell,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useDashboardStats } from "@/hooks/queries/admin/getDashboardStats";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

/* ===================== CALENDAR ===================== */
function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="rounded-2xl border bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="rounded-md border w-full"
        />
      </CardContent>
    </Card>
  );
}

/* ===================== MAIN ===================== */
export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<number | null>(null);
  const [platformEarnings, setPlatformEarnings] = useState<number | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  const { data, isLoading, error } = useDashboardStats();

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    const res = await fetch("/api/admin/wallet/balance");
    const data = await res.json();
    if (res.ok) setWalletBalance(data.balance);
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Real-time subscription for wallet transactions
  useEffect(() => {
    const channel = supabase
      .channel("admin-wallet-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallet_transactions",
          filter: "user_id=eq.00000000-0000-0000-0000-000000000000", // Platform wallet ID
        },
        () => {
          fetchWalletBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    fetch("/api/admin/wallet/monthly-sales")
      .then((r) => r.json())
      .then((d) => setMonthlySales(d.totalSales))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/wallet/platform-earnings")
      .then((r) => r.json())
      .then((d) => setPlatformEarnings(d.totalEarnings))
      .catch(() => {});
  }, []);

  // Fetch recent reports
  const fetchReports = async () => {
    const res = await fetch("/api/admin/getReports");
    if (res.ok) {
      const data = await res.json();
      const reports = data.reports || [];
      setRecentReports(reports.slice(0, 5)); // Get latest 5 reports
      setPendingReportsCount(reports.filter((r: any) => r.status === "Pending").length);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Real-time subscription for new reports
  useEffect(() => {
    const channel = supabase
      .channel("admin-reports")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (error instanceof Error && error.message === "unauthorized") {
      router.push("/unauthorized");
    }
  }, [error, router]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-[1600px] space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of EduCart platform performance
          </p>
        </div>

        {/* CALENDAR + EMPTY PANELS */}
        <div className="grid gap-6 lg:grid-cols-3">
          <CalendarDemo />

          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
            <NotificationsCard
              reports={recentReports}
              pendingCount={pendingReportsCount}
            />
            <RecentActivityCard />
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Account Balance"
            icon={<Wallet />}
            bgColor="#C7D9E5"
            value={walletBalance}
          />
          <KpiCard
            title="Monthly Sales"
            icon={<TrendingUp />}
            bgColor="#E6F6F1"
            value={monthlySales}
          />
          <KpiCard
            title="Platform Earnings"
            icon={<PiggyBank />}
            bgColor="#FEF7E5"
            value={platformEarnings}
          />
        </div>

        {/* STATS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users />}
            label="Individual Users"
            value={data?.individuals}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Building2 />}
            label="Organization Users"
            value={data?.organizations}
            isLoading={isLoading}
          />
          <StatCard
            icon={<ArrowUpRight />}
            label="Total Transactions"
            value={data?.transactions}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Activity />}
            label="Business Accounts"
            value="—"
          />
        </div>
      </div>
    </div>
  );
}

/* ===================== EMPTY STATE CARDS ===================== */

function NotificationsCard({
  reports,
  pendingCount,
}: {
  reports: any[];
  pendingCount: number;
}) {
  return (
    <Card className="rounded-2xl border bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Report Notifications
          </div>
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              <AlertCircle className="h-3 w-3" />
              {pendingCount} Pending
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[160px] overflow-y-auto">
        {reports.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center">
            <p className="text-sm text-slate-400">No reports available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => {
              const reporterName =
                report.reporter?.individuals?.full_name ||
                report.reporter?.organizations?.organization_name ||
                "Unknown User";

              const reportedName =
                report.reported_user?.individuals?.full_name ||
                report.reported_user?.organizations?.organization_name ||
                "Unknown User";

              return (
                <div
                  key={report.id}
                  className="rounded-lg border bg-slate-50 p-2 text-xs hover:bg-slate-100 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        New {report.report_target_type} Report
                      </p>
                      <p className="text-slate-600">
                        {reporterName} reported {reportedName}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        report.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              );
            })}
            <Link
              href="/admin/reports"
              className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700 pt-2"
            >
              View All Reports →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  return (
    <Card className="rounded-2xl border bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[160px] items-center justify-center">
        <p className="text-sm text-slate-400">
          No recent activity recorded
        </p>
      </CardContent>
    </Card>
  );
}

/* ===================== SHARED COMPONENTS ===================== */

function KpiCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <Card
      className="rounded-2xl border hover:shadow-md transition"
      style={{ backgroundColor: bgColor }}
    >
      <CardContent className="p-6">
        <div className="flex justify-between text-slate-700">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>

        {value !== null ? (
          <p className="mt-4 text-3xl font-bold text-slate-900">
            ₱
            <CountUp end={value} decimals={2} duration={1.2} />
          </p>
        ) : (
          <div className="mt-4 h-8 w-32 rounded bg-white/60 animate-pulse" />
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number | string | null;
  isLoading?: boolean;
}) {
  return (
    <Card className="rounded-2xl border bg-white hover:shadow-sm transition">
      <CardContent className="flex gap-4 p-6">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          {isLoading ? (
            <div className="mt-1 h-5 w-16 rounded bg-slate-200 animate-pulse" />
          ) : (
            <p className="text-xl font-semibold text-slate-900">
              {value ?? "—"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
