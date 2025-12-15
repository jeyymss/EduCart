"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  ShieldAlert,
  Ban,
  Mail,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useReports, type Report as ReportData } from "@/hooks/queries/admin/useReports";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

/* ===================== TYPES ===================== */
type DisplayReport = {
  id: string; // Display ID (reference_code or fallback to id)
  databaseId: string; // Actual database ID for API calls
  title: string;
  type: "Product" | "Transaction" | "User";
  status: "Pending" | "Resolved";
  details: string;
  reportedBy: {
    name: string;
    email: string;
  };
  target: {
    label: string;
    value: string;
    owner?: {
      name: string;
      email: string;
    };
  };
  reportType: string;
  createdAt: string;
  reportedUserId: string;
};

/* ===================== HELPER FUNCTIONS ===================== */
function transformReportData(report: ReportData): DisplayReport {
  // Get reporter name
  const reporterName = report.reporter.individuals?.full_name ||
                       report.reporter.organizations?.organization_name ||
                       "Unknown User";

  // Get reported user name
  const reportedUserName = report.reported_user.individuals?.full_name ||
                           report.reported_user.organizations?.organization_name ||
                           "Unknown User";

  // Determine title and target based on report type
  let title = "";
  let targetLabel = "";
  let targetValue = "";
  let targetOwner = undefined;

  if (report.report_target_type === "Item" && report.reported_item) {
    title = report.reported_item.item_title;
    targetLabel = "Item ID";
    targetValue = report.reported_item.id;
    targetOwner = {
      name: reportedUserName,
      email: report.reported_user.email,
    };
  } else if (report.report_target_type === "Transaction" && report.reported_transaction) {
    title = `Transaction ${report.reported_transaction.reference_code}`;
    targetLabel = "Transaction ID";
    targetValue = report.reported_transaction.id;
    targetOwner = {
      name: reportedUserName,
      email: report.reported_user.email,
    };
  } else {
    title = reportedUserName;
    targetLabel = "User Email";
    targetValue = report.reported_user.email;
  }

  return {
    id: report.reference_code || report.id,
    databaseId: report.id, // Actual database ID
    title,
    type: report.report_target_type === "Item" ? "Product" :
          report.report_target_type === "Transaction" ? "Transaction" : "User",
    status: report.status as "Pending" | "Resolved",
    details: report.description || "Please review our community guidelines.",
    reportedBy: {
      name: reporterName,
      email: report.reporter.email,
    },
    target: {
      label: targetLabel,
      value: targetValue,
      owner: targetOwner,
    },
    reportType: report.report_type,
    createdAt: report.created_at,
    reportedUserId: report.reported_user_id,
  };
}

/* ===================== PAGE ===================== */
export default function ReportsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: reportsData, isLoading, error } = useReports();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | DisplayReport["type"]>("All");
  const [openDetails, setOpenDetails] = useState<DisplayReport | null>(null);
  const [animate, setAnimate] = useState(false);
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* animation sync */
  useEffect(() => {
    if (openDetails) requestAnimationFrame(() => setAnimate(true));
    else setAnimate(false);
  }, [openDetails]);

  // Real-time subscription for reports
  useEffect(() => {
    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => {
          // Invalidate and refetch the reports query
          queryClient.invalidateQueries({ queryKey: ["adminReports"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // Handle warn user
  const handleWarn = async () => {
    if (!openDetails) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/reports/warn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: openDetails.databaseId,
          reportedUserId: openDetails.reportedUserId,
          reportType: openDetails.reportType,
          reason: openDetails.details,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to warn user");
      }

      toast.success("User warned successfully");
      setWarnDialogOpen(false);
      setOpenDetails(null);
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to warn user");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle suspend user
  const handleSuspend = async () => {
    if (!openDetails) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/reports/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: openDetails.databaseId,
          reportedUserId: openDetails.reportedUserId,
          reportType: openDetails.reportType,
          reason: openDetails.details,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to suspend user");
      }

      toast.success("User suspended successfully");
      setSuspendDialogOpen(false);
      setOpenDetails(null);
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  // Transform the data
  const reports = useMemo(() => {
    if (!reportsData) return [];
    return reportsData.map(transformReportData);
  }, [reportsData]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesType = type === "All" || r.type === type;
      const matchesQuery =
        !query ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [query, type, reports]);

  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[95%] space-y-6 p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[95%] space-y-6 p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Error loading reports: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[95%] space-y-6 p-6">

      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700">Pending Reports</p>
            <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Resolved Reports</p>
            <p className="text-2xl font-bold text-green-800">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== FILTERS ===== */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <h2 className="text-lg font-semibold">Reports</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="appearance-none rounded-xl border px-4 py-2 pr-9 text-sm"
              >
                <option value="All">All Types</option>
                <option value="Product">Product</option>
                <option value="Transaction">Transaction</option>
                <option value="User">User</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            <input
              placeholder="Search reports"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border px-4 py-2 text-sm w-[260px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== TABLE ===== */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold bg-[#C7D9E5]">
            <div className="col-span-4">Report</div>
            <div className="col-span-2">Report ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Details</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="text-sm">No reports found</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 px-6 py-4 border-b hover:bg-gray-50"
              >
                <div className="col-span-4 font-medium">{r.title}</div>
                <div className="col-span-2 text-gray-600">{r.id}</div>
                <div className="col-span-2">{r.type}</div>
                <div className="col-span-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenDetails(r)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ===== DETAILS DRAWER ===== */}
      {openDetails && (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              animate ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpenDetails(null)}
          />

          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-all duration-300 ease-out
              ${animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold">{openDetails.title}</h3>
                <p className="text-xs text-gray-500">
                  Report ID: {openDetails.id}
                </p>
              </div>
              <button onClick={() => setOpenDetails(null)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <div>
                    <strong>{openDetails.target.label}:</strong>{" "}
                    {openDetails.target.value}
                  </div>

                  {openDetails.target.owner && (
                    <>
                      <div>
                        <strong>Seller:</strong>{" "}
                        {openDetails.target.owner.name}
                      </div>
                      <div className="text-xs">
                        {openDetails.target.owner.email}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500">Reported by</div>
                  <div className="font-medium">
                    {openDetails.reportedBy.name}
                  </div>
                  <div className="text-xs">
                    {openDetails.reportedBy.email}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500">Report Type</div>
                  <div className="font-medium capitalize">
                    {openDetails.reportType}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="mt-1">{openDetails.details}</div>
                </CardContent>
              </Card>
            </div>

            <div className="border-t p-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setWarnDialogOpen(true)}
                disabled={openDetails.status === "Resolved"}
              >
                <ShieldAlert className="h-4 w-4 mr-1" /> Warn
              </Button>
              <Button
                variant="outline"
                onClick={() => setSuspendDialogOpen(true)}
                disabled={openDetails.status === "Resolved"}
              >
                <Ban className="h-4 w-4 mr-1" /> Suspend
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-1" /> Email OSA
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== WARN CONFIRMATION DIALOG ===== */}
      <AlertDialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warn User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to issue a warning to this user? They will
              receive a notification about this warning, and the report will be
              marked as resolved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarn}
              disabled={actionLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Warning...
                </>
              ) : (
                "Warn User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== SUSPEND CONFIRMATION DIALOG ===== */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this user's account? This will
              prevent them from accessing the platform. They will receive a
              notification about the suspension, and the report will be marked as
              resolved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
