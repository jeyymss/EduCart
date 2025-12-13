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
} from "lucide-react";

import { useDashboardStats } from "@/hooks/queries/admin/getDashboardStats";

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

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<number | null>(null);
  const [platformEarnings, setPlatformEarnings] = useState<number | null>(null);

  const { data, isLoading, error } = useDashboardStats();

  useEffect(() => {
    fetch("/api/admin/wallet/balance")
      .then((r) => r.json())
      .then((d) => setWalletBalance(d.balance))
      .catch(() => {});
  }, []);

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
            <NotificationsCard />
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

function NotificationsCard() {
  return (
    <Card className="rounded-2xl border bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[160px] items-center justify-center">
        <p className="text-sm text-slate-400">
          No notifications available
        </p>
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
