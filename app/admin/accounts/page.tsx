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
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border text-left">User</th>
            <th className="px-4 py-2 border text-left">Role</th>
            <th className="px-4 py-2 border text-left">University</th>
            {/* <th className="px-4 py-2 border text-left">Verification Status</th> */}
            <th className="px-4 py-2 border text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar_url ?? undefined} alt={u.name} />
                    <AvatarFallback>{initialsFrom(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium leading-5">{u.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </div>
                </div>
              </td>

              <td className="px-4 py-2 border">{u.role}</td>
              <td className="px-4 py-2 border">{u.university ?? "N/A"}</td>

              <td className="px-4 py-2 border">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
