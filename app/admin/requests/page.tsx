"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Loader2,
  X,
  Check,
  XCircle,
  FileText,
  Mail,
  User,
  GraduationCap,
  Calendar,
  Hash,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

/* ===================== TYPES ===================== */
type RequestStatus = "pending" | "approved" | "rejected";

type UniversityRequest = {
  id: string;
  request_id: string;
  school_name: string;
  abbreviation: string | null;
  domain: string | null;
  reason: string | null;
  requester_email: string;
  requester_name: string;
  status: RequestStatus;
  created_at: string;
};

type SchoolRequest = {
  id: string;
  requestId: string;
  status: RequestStatus;
  schoolName: string;
  requestedBy: string;
  email: string;
  createdAt: string;
  details: {
    schoolAbbreviation?: string;
    schoolDomain?: string;
    reason?: string;
  };
};

/* ===================== EMAIL TEMPLATES ===================== */
const APPROVAL_TEMPLATE = `Dear {requester_name},

Thank you for your interest in adding {school_name} to EduCart!

We are pleased to inform you that your school registration request has been approved. {school_name} is now part of the EduCart marketplace platform.

Students and faculty from your institution can now register using their school email addresses and start using our platform to buy, sell, and trade items safely within your campus community.

If you have any questions or need assistance with the onboarding process, please don't hesitate to reach out.

Best regards,
EduCart Admin Team`;

const REJECTION_TEMPLATE = `Dear {requester_name},

Thank you for your interest in adding {school_name} to EduCart.

After careful review of your application, we regret to inform you that we are unable to approve your school registration request at this time.

This decision may be due to one or more of the following reasons:
- Incomplete or insufficient information provided
- Unable to verify the institution's accreditation
- The school does not meet our current eligibility criteria

If you believe this decision was made in error or if you have additional information to provide, please feel free to submit a new request with the required documentation.

Thank you for your understanding.

Best regards,
EduCart Admin Team`;

/* ===================== PAGE ===================== */
export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch university requests from API
  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/admin/university-requests");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch requests");
        }

        // Transform data to match the component's expected format
        const transformed: SchoolRequest[] = (json.data || []).map((r: UniversityRequest) => ({
          id: r.id,
          requestId: r.request_id,
          status: r.status,
          schoolName: r.school_name,
          requestedBy: r.requester_name,
          email: r.requester_email,
          createdAt: r.created_at,
          details: {
            schoolAbbreviation: r.abbreviation || undefined,
            schoolDomain: r.domain || undefined,
            reason: r.reason || undefined,
          },
        }));

        setRequests(transformed);
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        toast.error(error.message || "Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SchoolRequest | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        r.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  const openReviewModal = (request: SchoolRequest) => {
    setSelectedRequest(request);
    setEmailSubject(`Re: EduCart School Request - ${request.schoolName}`);
    setEmailMessage("");
    setDecision(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    setEmailSubject("");
    setEmailMessage("");
    setDecision(null);
  };

  const applyTemplate = (type: "approval" | "rejection") => {
    if (!selectedRequest) return;

    const template = type === "approval" ? APPROVAL_TEMPLATE : REJECTION_TEMPLATE;
    const filledTemplate = template
      .replace(/{requester_name}/g, selectedRequest.requestedBy)
      .replace(/{school_name}/g, selectedRequest.schoolName);

    setEmailMessage(filledTemplate);
    setDecision(type === "approval" ? "approve" : "reject");
  };

  const handleSendEmail = async () => {
    if (!selectedRequest || !decision) {
      toast.error("Please select a decision (Approve or Reject)");
      return;
    }

    if (!emailMessage.trim()) {
      toast.error("Please enter an email message");
      return;
    }

    setActionLoading(true);
    try {
      const newStatus: RequestStatus = decision === "approve" ? "approved" : "rejected";

      // Update status in database
      const res = await fetch("/api/admin/university-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          decision,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update request status");
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: newStatus } : r
        )
      );

      if (decision === "approve") {
        toast.success("School request approved and email sent");
        closeModal();

        // Redirect to schools page with pre-filled data
        const params = new URLSearchParams({
          openAddModal: "true",
          name: selectedRequest.schoolName,
          abbreviation: selectedRequest.details.schoolAbbreviation || "",
          domain: selectedRequest.details.schoolDomain || "",
        });
        router.push(`/admin/schools?${params.toString()}`);
      } else {
        toast.success("School request rejected and email sent");
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Rejected
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[95%] space-y-6 p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[95%] space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Requests</h1>
        <p className="text-sm text-slate-500">
          Review and manage school applications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700">Pending Schools</p>
            <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Approved Schools</p>
            <p className="text-2xl font-bold text-green-800">{approvedCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs text-red-700">Rejected Schools</p>
            <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">School Requests</h2>
        <p className="text-sm text-slate-500">
          Users requesting to add their schools to the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search school, name, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            resetPage();
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Result Count */}
      <p className="text-xs text-gray-500">
        Showing {filteredRequests.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
      </p>

      {/* Table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold bg-[#C7D9E5]">
            <div className="col-span-2">School Name</div>
            <div className="col-span-2">Requested By</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {paginatedRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="text-sm">No requests found</p>
            </div>
          ) : (
            paginatedRequests.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 px-6 py-4 border-b hover:bg-gray-50 items-center"
              >
                <div className="col-span-2 font-medium">{r.schoolName}</div>
                <div className="col-span-2 text-sm">{r.requestedBy}</div>
                <div className="col-span-3 text-sm text-gray-600 truncate">{r.email}</div>
                <div className="col-span-2 text-sm text-gray-600">
                  {formatDate(r.createdAt)}
                </div>
                <div className="col-span-1">{getStatusBadge(r.status)}</div>
                <div className="col-span-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReviewModal(r)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="gap-1 px-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:block">Previous</span>
              </Button>
            </PaginationItem>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
              const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              if (!showPage) return null;

              return (
                <PaginationItem key={page}>
                  <Button
                    variant={currentPage === page ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "pointer-events-none" : ""}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="gap-1 px-2.5"
              >
                <span className="hidden sm:block">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Review Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Review School Request - {selectedRequest?.schoolName || "Loading..."}</DialogTitle>
          </VisuallyHidden>

          {/* Close Button */}
          <Button
            onClick={closeModal}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg z-50"
          >
            <X className="h-4 w-4" />
          </Button>

          <ScrollArea className="h-[95vh]">
            <div className="p-6 space-y-6">
              {/* Modal Header */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review School Request</h2>
                <p className="text-sm text-gray-500">
                  Review and respond to the school application via email
                </p>
              </div>

              <Separator />

              {selectedRequest && (
                <>
                  {/* Request Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FDB813]" />
                      Request Details
                    </h3>

                    <Card className="border-gray-200">
                      <CardContent className="p-4 space-y-4">
                        {/* Request ID & Date */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                              <Hash className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Request ID</p>
                              <p className="text-sm text-gray-900 font-mono">{selectedRequest.requestId}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                              <Calendar className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Date Requested</p>
                              <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* School Name */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                            <GraduationCap className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">School Name</p>
                            <p className="text-sm text-gray-900 font-medium">{selectedRequest.schoolName}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Abbreviation & Domain */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                              <Building2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Abbreviation</p>
                              <p className="text-sm text-gray-900">{selectedRequest.details.schoolAbbreviation || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                              <Globe className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Domain</p>
                              <p className="text-sm text-gray-900">{selectedRequest.details.schoolDomain || "Not specified"}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Requested By */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Requested By</p>
                            <p className="text-sm text-gray-900">{selectedRequest.requestedBy}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Contact Email */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Contact Email</p>
                            <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Reason for Request */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500">Reason for Request</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {selectedRequest.details.reason || "No reason provided"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Banner for already processed requests */}
                  {selectedRequest.status !== "pending" && (
                    <>
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${
                        selectedRequest.status === "approved"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}>
                        {selectedRequest.status === "approved" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            selectedRequest.status === "approved" ? "text-green-800" : "text-red-800"
                          }`}>
                            This request has been {selectedRequest.status}
                          </p>
                          <p className={`text-sm ${
                            selectedRequest.status === "approved" ? "text-green-600" : "text-red-600"
                          }`}>
                            No further action is required.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pb-2">
                        <Button variant="outline" onClick={closeModal}>
                          Close
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Only show email response and actions for pending requests */}
                  {selectedRequest.status === "pending" && (
                    <>
                      <Separator />

                      {/* Email Response Section */}
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#FDB813]" />
                          Email Response
                        </h3>

                        <Card className="border-gray-200">
                          <CardContent className="p-4 space-y-4">
                            {/* To */}
                            <div className="space-y-2">
                              <Label htmlFor="email-to" className="text-sm font-medium">
                                To:
                              </Label>
                              <Input
                                id="email-to"
                                value={selectedRequest.email}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                              <Label htmlFor="email-subject" className="text-sm font-medium">
                                Subject:
                              </Label>
                              <Input
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter email subject"
                              />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                              <Label htmlFor="email-message" className="text-sm font-medium">
                                Message:
                              </Label>
                              <Textarea
                                id="email-message"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder="Enter your email message..."
                                rows={10}
                                className="resize-none"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Quick Actions</p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => applyTemplate("approval")}
                            className="flex-1"
                          >
                            Use Approval Template
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => applyTemplate("rejection")}
                            className="flex-1"
                          >
                            Use Rejection Template
                          </Button>
                        </div>
                      </div>

                      {/* Decision Buttons */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Decision</p>
                        <div className="flex gap-3">
                          <Button
                            variant={decision === "approve" ? "default" : "outline"}
                            onClick={() => setDecision("approve")}
                            className={`flex-1 ${
                              decision === "approve"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve School
                          </Button>
                          <Button
                            variant={decision === "reject" ? "default" : "outline"}
                            onClick={() => setDecision("reject")}
                            className={`flex-1 ${
                              decision === "reject"
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "border-red-200 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject School
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pb-2">
                        <Button variant="outline" onClick={closeModal} disabled={actionLoading}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendEmail}
                          disabled={actionLoading || !decision || !emailMessage.trim()}
                          className="bg-[#FDB813] hover:bg-[#e5a811] text-black"
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
