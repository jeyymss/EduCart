"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import AvatarUploader from "@/components/AvatarUploader";
import BackgroundUploader from "@/components/BackgroundUploader";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useUserPosts } from "@/hooks/queries/displayItems";
import { UserPosts } from "@/components/profile/UserPosts";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Error fetching user: {(error as Error).message}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* 🔹 Background uploader */}
      <div className="relative w-full h-40 md:h-60">
        <BackgroundUploader
          userId={user.id}
          role={user.role === "Organization" ? "organization" : "individual"}
          currentUrl={user.background_url}
        />
      </div>

      <div className="flex flex-col gap-4 p-4 w-full max-w-lg -mt-12">
        <h1 className="text-2xl font-semibold">Profile Page</h1>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user?.avatar_url ?? ""}
              alt={user?.full_name ?? "User"}
            />
            <AvatarFallback>
              <Image
                src="/avatarplaceholder.png"
                alt="Avatar Placeholder"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-medium">{user.full_name ?? "Unnamed User"}</p>
            <p className="text-sm text-muted-foreground">
              {user.universities?.abbreviation ?? "N/A"} · {user.role ?? "—"}
            </p>
          </div>
        </div>

        {/* Avatar uploader */}
        <AvatarUploader currentUrl={user.avatar_url ?? undefined} />

        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* 🔹 User Posts Section */}
      <div className="w-full max-w-5xl mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="listed">Listed</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
            <TabsTrigger value="unlisted">Unlisted</TabsTrigger>
          </TabsList>

          {/* All Posts */}
          <TabsContent value="posts">
            <UserPosts userId={user.id} />
          </TabsContent>

          {/* Listed */}
          <TabsContent value="listed">
            <UserPosts userId={user.id} status="Listed" />
          </TabsContent>

          {/* Sold */}
          <TabsContent value="sold">
            <UserPosts userId={user.id} status="Sold" />
          </TabsContent>

          {/* Unlisted */}
          <TabsContent value="unlisted">
            <UserPosts userId={user.id} status="Unlisted" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
