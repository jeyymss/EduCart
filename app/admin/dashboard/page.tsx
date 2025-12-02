"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Users,
  Building2,
  Users2,
  Receipt,
  CheckCircle2,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDashboardStats } from "@/hooks/queries/admin/getDashboardStats";

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="rounded-xl shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="rounded-md border shadow-sm w-full"
        />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useDashboardStats();

  //fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/admin/wallet/balance");
        const data = await res.json();

        if (res.ok) {
          setWalletBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch platform wallet balance:", error);
      }
    };

    fetchBalance();
  }, []);

  //fetch monthly sales
  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const res = await fetch("/api/admin/wallet/monthly-sales");
        const data = await res.json();

        if (res.ok) {
          setMonthlySales(data.totalSales);
        }
      } catch (error) {
        console.error("Failed to fetch monthly sales:", error);
      }
    };

    fetchMonthlySales();
  }, []);


  useEffect(() => {
    if (error instanceof Error && error.message === "unauthorized") {
      router.push("/unauthorized");
    }
  }, [error, router]);

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Hello, EduCart Admin!
        </h2>

        {/* Calendar + KPI placeholders */}
        <div className="grid gap-6 lg:grid-cols-4 items-stretch">
          <div className="lg:col-span-1 h-full">
            <CalendarDemo />
          </div>

          <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 h-full">
            <KpiCard
              title="Account Balance"
              value={
                walletBalance !== null
                  ? "₱" +
                    walletBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })
                  : null
              }
            />

            <KpiCard
              title="Total Sales"
              value={
                monthlySales !== null
                  ? "₱" +
                    monthlySales.toLocaleString("en-PH", { minimumFractionDigits: 2 })
                  : null
              }
            />

            <KpiCard title="Platform Earnings" />
          </div>
        </div>

        {/* Secondary Stats (Counts) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<Users className="h-5 w-5 text-slate-500" />}
            label="Individual Users"
            value={isError ? "Error" : data?.individuals?.toLocaleString()}
            isLoading={isLoading}
          />

          <StatCard
            icon={<Building2 className="h-5 w-5 text-slate-500" />}
            label="Business Accounts"
            value="—"
            isLoading={isLoading}
          />

          <StatCard
            icon={<Users className="h-5 w-5 text-slate-500" />}
            label="Organization Users"
            value={isError ? "Error" : data?.organizations?.toLocaleString()}
            isLoading={isLoading}
          />

          <StatCard
            icon={<Users className="h-5 w-5 text-slate-500" />}
            label="Total Transactions"
            value={isError ? "Error" : data?.transactions?.toLocaleString()}
            isLoading={isLoading}
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-slate-500" />}
            label="Invoice Paid"
            value="—"
            isLoading={isLoading}
          />

          <StatCard
            icon={<Sun className="h-5 w-5 text-slate-500" />}
            label="Invoice Unpaid"
            value="—"
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              No activities yet.
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              No notifications yet.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value?: string | null }) {
  return (
    <Card className="rounded-xl shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-6 flex items-center">
        {value ? (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        ) : (
          <div className="h-7 w-36 rounded-md bg-slate-100 animate-pulse" />
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
    <Card className="rounded-xl shadow-sm h-full">
      <CardContent className="flex flex-col items-center justify-center p-5">
        {icon}
        <p className="mt-2 text-xs text-slate-500">{label}</p>

        {isLoading ? (
          <div className="mt-1 h-5 w-10 rounded bg-slate-100 animate-pulse" />
        ) : (
          <p className="mt-1 text-xl font-semibold text-slate-800">
            {value ?? "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
