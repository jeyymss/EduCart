"use client"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { manageUsers } from "@/hooks/queries/manageUsers";

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

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!users || users.length === 0) return <p>No users found.</p>;

  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 mt-8">
      <table className="min-w-full text-sm text-left">
        {/* Table Header */}
        <thead className="bg-[#FEF7E5] text-gray-800">
          <tr>
            <th className="px-6 py-3 font-semibold">User</th>
            <th className="px-6 py-3 font-semibold">Role</th>
            <th className="px-6 py-3 font-semibold">University</th>
            <th className="px-6 py-3 font-semibold">Joined</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {users.map((u) => (
            <tr
              key={u.user_id}
              className="bg-white hover:bg-[#f5eeda] transition-colors"
            >
              {/* User Info + Avatar */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                    <AvatarImage src={u.avatar_url ?? undefined} alt={u.name} />
                    <AvatarFallback>{initialsFrom(u.name)}</AvatarFallback>
                  </Avatar>

                  {/* User name and email */}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{u.name}</span>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </div>
                </div>
              </td>

              {/* Role column */}
              <td className="px-6 py-4 text-gray-700">{u.role}</td>

              {/* University column */}
              <td className="px-6 py-4 text-gray-700">
                {u.university ?? "N/A"}
              </td>

              {/* Joined date */}
              <td className="px-6 py-4 text-gray-700">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}