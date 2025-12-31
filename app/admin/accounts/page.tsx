"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, MoreVertical, Eye, AlertTriangle, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { manageUsers } from "@/hooks/queries/admin/manageUsers";

function initialsFrom(name?: string) {
  if (!name) return "ED";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function ManageUsers() {
  const router = useRouter();
  const { data: users, isLoading, isError, error, refetch } = manageUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Dialog states
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [warnReason, setWarnReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || u.role === roleFilter;

      const matchesSchool =
        schoolFilter === "all" || u.university === schoolFilter;

      return matchesSearch && matchesRole && matchesSchool;
    });
  }, [users, search, roleFilter, schoolFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  const roles = useMemo(() => {
    if (!users) return [];
    return Array.from(new Set(users.map((u) => u.role).filter(Boolean)));
  }, [users]);

  const schools = useMemo(() => {
    if (!users) return [];
    return Array.from(new Set(users.map((u) => u.university).filter(Boolean)));
  }, [users]);

  const handleViewProfile = (userId: string) => {
    router.push(`/${userId}`);
  };

  const handleWarnUser = (user: any) => {
    setSelectedUser(user);
    setWarnDialogOpen(true);
  };

  const handleSuspendUser = (user: any) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmWarn = () => {
    if (!selectedUser) return;
    // TODO: Call API to warn user
    toast.warning(`Warning sent to ${selectedUser.name}`);
    setWarnDialogOpen(false);
    setWarnReason("");
    setSelectedUser(null);
  };

  const confirmSuspend = () => {
    if (!selectedUser) return;
    // TODO: Call API to suspend user
    toast.error(`${selectedUser.name} has been suspended`);
    setSuspendDialogOpen(false);
    setSuspendReason("");
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.user_id }),
      });

      if (res.ok) {
        toast.success(`${selectedUser.name} has been deleted`);
        refetch();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStatusBadge = () => {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  if (isLoading) return <p className="mt-6 text-sm text-gray-500">Loading users...</p>;
  if (isError) return <p className="mt-6 text-sm text-red-500">Error: {error.message}</p>;
  if (!users || users.length === 0)
    return <p className="mt-6 text-sm text-gray-500">No users found.</p>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">
            Manage platform users, roles, and permissions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            {/* School Filter */}
            <Select value={schoolFilter} onValueChange={(val) => {
              setSchoolFilter(val);
              resetPage();
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All schools</SelectItem>
                {schools.map((school, idx) => {
                  const value = school ?? "Unknown";
                  return (
                    <SelectItem key={`${value}-${idx}`} value={value}>
                      {value}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(val) => {
              setRoleFilter(val);
              resetPage();
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result Count */}
        <p className="text-xs text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#FEF7E5] text-gray-800">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">School</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Credits</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No users match your filters
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u.user_id}
                    className="bg-white hover:bg-[#f5eeda] transition-colors border-b last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                          <AvatarImage
                            src={u.avatar_url ?? undefined}
                            alt={u.name}
                          />
                          <AvatarFallback>
                            {initialsFrom(u.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {u.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {u.university ?? "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {u.credits?.toFixed(2) ?? "0.00"}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge()}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewProfile(u.user_id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleWarnUser(u)}
                            className="text-yellow-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Warn User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(u)}
                            className="text-orange-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(u)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
                // Show first page, last page, current page, and pages around current
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
      </div>

      {/* Warn User Dialog */}
      <Dialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warn User</DialogTitle>
            <DialogDescription>
              Send a warning to {selectedUser?.name}. This action will notify the user of a policy violation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter warning reason..."
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmWarn} className="bg-yellow-600 hover:bg-yellow-700">
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {selectedUser?.name}&apos;s account. They will not be able to access the platform until unsuspended.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter suspension reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSuspend} className="bg-orange-600 hover:bg-orange-700">
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedUser?.name}&apos;s account
              and remove all their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
