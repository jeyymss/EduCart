"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

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
  const { data: users, isLoading, isError, error } = manageUsers();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roles = useMemo(() => {
    if (!users) return [];
    return Array.from(new Set(users.map((u) => u.role)));
  }, [users]);

  if (isLoading) return <p className="mt-6 text-sm text-gray-500">Loading users...</p>;
  if (isError) return <p className="mt-6 text-sm text-red-500">Error: {error.message}</p>;
  if (!users || users.length === 0)
    return <p className="mt-6 text-sm text-gray-500">No users found.</p>;

  return (
    <div className="mt-8 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
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
        Showing {filteredUsers.length} of {users.length} accounts
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#FEF7E5] text-gray-800">
            <tr>
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">University</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No accounts match your filters
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.user_id}
                  className="bg-white hover:bg-[#f5eeda] transition-colors"
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

                  <td className="px-6 py-4 text-gray-700">{u.role}</td>

                  <td className="px-6 py-4 text-gray-700">
                    {u.university ?? "N/A"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
