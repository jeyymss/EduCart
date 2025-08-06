"use client";

import { manageUsers } from "@/hooks/manageUsers";

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
            <th className="px-4 py-2 border">Full Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">University</th>
            <th className="px-4 py-2 border">Verification Status</th>
            <th className="px-4 py-2 border">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{user.full_name}</td>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border">{user.role}</td>
              <td className="px-4 py-2 border">
                {user.universities?.abbreviation || "N/A"}
              </td>
              <td className="px-4 py-2 border">{user.verification_status}</td>
              <td className="px-4 py-2 border">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
