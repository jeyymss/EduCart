"use client";

import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    error,
  }: {
    data: UserProfile | undefined;
    isLoading: boolean;
    error: unknown;
  } = useUserProfile();

  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold mb-4">Profile Page</h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error fetching user: {(error as Error).message}</p>
        ) : (
          user && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user.full_name}
              </p>
              <p>
                <strong>University:</strong>{" "}
                {user.universities?.abbreviation ?? "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Status:</strong> {user.verification_status}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
