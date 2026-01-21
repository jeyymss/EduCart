"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Users,
  Coins,
  Percent,
  DollarSign,
  TrendingUp,
  Activity,
  FileText,
  Loader2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useDashboardStats } from "@/hooks/queries/admin/getDashboardStats";
import { useUserActivity, usePostTypes, useRevenue } from "@/hooks/queries/admin/useAnalytics";
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

  // Filter states
  const [userActivityDays, setUserActivityDays] = useState(30);
  const [postTypesDays, setPostTypesDays] = useState(30);
  const [revenueMonths, setRevenueMonths] = useState(6);

  const { data, isLoading, error } = useDashboardStats();
  const { data: userActivityData, isLoading: isLoadingActivity } = useUserActivity(userActivityDays);
  const { data: postTypesData, isLoading: isLoadingPostTypes } = usePostTypes(postTypesDays);
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenue(revenueMonths);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

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

  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers ?? 0,
      icon: Users,
      prefix: "",
    },
    {
      title: "Credit Sales",
      value: data?.creditSales ?? 0,
      icon: Coins,
      prefix: "₱",
    },
    {
      title: "Commissions",
      value: data?.commissions ?? 0,
      icon: Percent,
      prefix: "₱",
    },
    {
      title: "Monthly Revenue",
      value: data?.monthlyRevenue ?? 0,
      icon: DollarSign,
      prefix: "₱",
    },
  ]

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[95%] space-y-6 p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

        {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <>
                      {stat.prefix}
                      <CountUp
                        end={stat.value}
                        duration={2}
                        separator=","
                        decimals={stat.prefix ? 2 : 0}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="user-activity" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="user-activity" className="hover:cursor-pointer hover:bg-gray-50">
            <Activity className="w-4 h-4 mr-2" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="post-types" className="hover:cursor-pointer hover:bg-gray-50">
            <FileText className="w-4 h-4 mr-2" />
            Post Types
          </TabsTrigger>
          <TabsTrigger value="revenue" className="hover:cursor-pointer hover:bg-gray-50">
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
        </TabsList>

        {/* User Activity Tab */}
        <TabsContent value="user-activity" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Activity Analytics</h3>
            <Select
              value={userActivityDays.toString()}
              onValueChange={(value) => setUserActivityDays(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Users (Last 7 Days)</CardTitle>
                <CardDescription>Users who signed in recently</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-primary">
                    <CountUp end={userActivityData?.activeUsers || 0} duration={2} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Users (Last {userActivityDays} Days)</CardTitle>
                <CardDescription>Recently registered accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-primary">
                    <CountUp end={userActivityData?.newUsers || 0} duration={2} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly New Users</CardTitle>
              <CardDescription>New user registrations by week</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivityData?.weeklyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#8884d8" name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post Types Tab */}
        <TabsContent value="post-types" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaction Type Analytics</h3>
            <Select
              value={postTypesDays.toString()}
              onValueChange={(value) => setPostTypesDays(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Transactions by post type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPostTypes ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Loading chart...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={postTypesData?.data || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="transactions"
                      >
                        {postTypesData?.data?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Count by Type</CardTitle>
                <CardDescription>Total transactions per post type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPostTypes ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Loading chart...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={postTypesData?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transactions" fill="#00C49F" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
            <Select
              value={revenueMonths.toString()}
              onValueChange={(value) => setRevenueMonths(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Revenue Trend (Last {revenueMonths} {revenueMonths === 1 ? "Month" : "Months"})
              </CardTitle>
              <CardDescription>Monthly revenue from platform sales</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `₱${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Revenue (₱)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      </div>
    </div>
  );
}

