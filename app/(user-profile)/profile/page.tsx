"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Filter, Camera } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserPosts } from "@/components/profile/UserPosts";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [newBackground, setNewBackground] = useState<string | null>(null);

  // 👇 state to control listings filter
  const [listingFilter, setListingFilter] = useState<
    "Posts" | "Listed" | "Sold" | "Unlisted"
  >("Posts");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

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

  const initials = (user?.full_name ?? "U")
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Handle file previews
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewBackground(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔹 Background Image */}
      <div className="relative w-full h-40 md:h-60">
        <img
          src={newBackground ?? user.background_url ?? "/placeholder-bg.jpg"}
          alt="Background"
          className="w-full h-full object-cover"
        />

        {/* 🔹 Background edit overlay */}
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40">
            <button
              onClick={() => backgroundInputRef.current?.click()}
              className="p-3 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={backgroundInputRef}
              onChange={handleBackgroundChange}
              className="hidden"
            />
          </div>
        )}

        {/* 🔹 Save / Cancel inside background */}
        {isEditing && (
          <div className="absolute bottom-3 right-3 flex gap-3">
            <Button
              onClick={() => {
                // TODO: save newAvatar and newBackground to backend
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewAvatar(null);
                setNewBackground(null);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* 🔹 Edit Profile button */}
        {!isEditing && (
          <div className="absolute top-2 right-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* 🔹 Profile Layout */}
      <div className="w-full mt-1 px-15">
        {/* Avatar & Profile Info */}
        <div className="flex items-start gap-4 -mt-16">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-white shadow-md rounded-full">
              <AvatarImage
                src={newAvatar ?? user.avatar_url ?? ""}
                alt={user?.full_name ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {/* 🔹 Avatar edit overlay */}
            {isEditing && (
              <>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 mt-17">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {user.full_name ?? "Unnamed User"}
            </h1>
            <p className="text-base text-muted-foreground">
              {user.bio ?? "This user has no bio yet."}
            </p>
            <div className="flex gap-2 mt-2">
              {user.role && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {user.role}
                </span>
              )}
              {user.universities?.abbreviation && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {user.universities.abbreviation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full mt-6">
          <TabsList className="justify-start border-b w-full mb-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* 🔹 Posts Tab */}
          <TabsContent value="posts">
            <section className="border border-gray-300 rounded-2xl bg-white p-6 shadow-sm w-full">
              {/* Header + Filters */}
              <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                {/* 🔹 Listings with integrated dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-xl font-semibold focus:outline-none">
                    Listings (
                    <UserPosts.Count
                      userId={user.id}
                      status={listingFilter === "Posts" ? undefined : listingFilter}
                    />
                    ) – {listingFilter}
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setListingFilter("Posts")}>
                      Posts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setListingFilter("Listed")}>
                      Listed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setListingFilter("Sold")}>
                      Sold
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setListingFilter("Unlisted")}
                    >
                      Unlisted
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 🔹 Search + Filter */}
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
                      Post Type <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Sell</DropdownMenuItem>
                      <DropdownMenuItem>Rent</DropdownMenuItem>
                      <DropdownMenuItem>Trade</DropdownMenuItem>
                      <DropdownMenuItem>Emergency Lending</DropdownMenuItem>
                      <DropdownMenuItem>Pasabuy</DropdownMenuItem>
                      <DropdownMenuItem>Giveaway</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input
                    type="text"
                    placeholder="Search items"
                    className="h-9 w-[200px] text-sm"
                  />
                  <button className="p-2 border rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Listings Grid */}
              {listingFilter === "Posts" && <UserPosts userId={user.id} />}
              {listingFilter === "Listed" && (
                <UserPosts userId={user.id} status="Listed" />
              )}
              {listingFilter === "Sold" && (
                <UserPosts userId={user.id} status="Sold" />
              )}
              {listingFilter === "Unlisted" && (
                <UserPosts userId={user.id} status="Unlisted" />
              )}
            </section>
          </TabsContent>

          <TabsContent value="favorites">
            <p className="text-sm text-muted-foreground">Favorites go here.</p>
          </TabsContent>

          <TabsContent value="transactions">
            <p className="text-sm text-muted-foreground">
              Transactions go here.
            </p>
          </TabsContent>

          <TabsContent value="reviews">
            <p className="text-sm text-muted-foreground">Reviews go here.</p>
          </TabsContent>

          <TabsContent value="settings">
            <p className="text-sm text-muted-foreground">Settings go here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
