"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import AvatarUploader from "@/components/AvatarUploader";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();

  const initials =
    user?.full_name
      ?.split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Profile Page</h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error fetching user: {(error as Error).message}</p>
        ) : user ? (
          <>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user.avatar_url ?? undefined}
                  alt={user.full_name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.universities?.abbreviation ?? "N/A"} · {user.role}
                </p>
              </div>
            </div>

            {/* Uploader */}
            <AvatarUploader currentUrl={user.avatar_url ?? undefined} />

            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email}
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
          </>
        ) : null}
      </div>
    </div>
  );
}
