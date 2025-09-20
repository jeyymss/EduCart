"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Camera } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserPosts } from "@/components/profile/UserPosts";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import { SettingsPanel } from "@/components/profile/SettingsPanel";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [newBackground, setNewBackground] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // ✅ Manage active tab from URL hash
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveTab(hash);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

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
    <div className="min-h-screen flex flex-col relative">
      {/* ---------- Profile Header ---------- */}
      <div className="pb-8">
        {/* Cover photo */}
        <div className="relative w-full h-40 md:h-60">
          <img
            src={newBackground ?? user.background_url ?? "/placeholder-bg.jpg"}
            alt="Background"
            className="w-full h-full object-cover"
          />

          {/* Background edit overlay */}
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

          {/* Save/Cancel */}
          {isEditing && (
            <div className="absolute bottom-3 right-3 flex gap-3">
              <Button
                onClick={() => {
                  setIsEditing(false);
                }}
                className="bg-[#E59E2C] text-white hover:bg-[#d4881f]"
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

        {/* Avatar + Info */}
        <div className="bg-white shadow-sm px-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative -mt-16">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-md rounded-full">
                <AvatarImage
                  src={newAvatar ?? user.avatar_url ?? ""}
                  alt={user?.full_name ?? "User"}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

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
            <div className="flex-1 mt-2">
              <h1 className="text-2xl font-bold">
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
        </div>
      </div>

      {/* ---------- Main Content ---------- */}
      <div className="flex-1 px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="sticky top-0 z-30 bg-white border-b">
            <TabsList className="flex w-full p-0 bg-transparent h-auto">
              {["posts", "favorites", "transactions", "reviews", "settings"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="tab-trigger px-4 py-3"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </div>

          {/* -------------------- POSTS -------------------- */}
          <TabsContent value="posts">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full overflow-hidden">
              <Tabs defaultValue="posts" className="w-full">
                <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
                  <TabsList className="flex bg-transparent h-auto">
                    <TabsTrigger value="posts" className="tab-trigger">
                      Posts (<UserPosts.Count userId={user.id} />)
                    </TabsTrigger>
                    <TabsTrigger value="listed" className="tab-trigger">
                      Listed (<UserPosts.Count userId={user.id} status="Listed" />)
                    </TabsTrigger>
                    <TabsTrigger value="sold" className="tab-trigger">
                      Sold (<UserPosts.Count userId={user.id} status="Sold" />)
                    </TabsTrigger>
                    <TabsTrigger value="unlisted" className="tab-trigger">
                      Unlisted (<UserPosts.Count userId={user.id} status="Unlisted" />)
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-3">
        
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
                    <AdvancedFilters onApply={(f) => console.log("Post filters:", f)} />
                  </div>
                </div>

                <TabsContent value="posts">
                  <div className="p-4">
                    <UserPosts userId={user.id} />
                  </div>
                </TabsContent>
                <TabsContent value="listed">
                  <div className="p-4">
                    <UserPosts userId={user.id} status="Listed" />
                  </div>
                </TabsContent>
                <TabsContent value="sold">
                  <div className="p-4">
                    <UserPosts userId={user.id} status="Sold" />
                  </div>
                </TabsContent>
                <TabsContent value="unlisted">
                  <div className="p-4">
                    <UserPosts userId={user.id} status="Unlisted" />
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </TabsContent>

          {/* -------------------- FAVORITES -------------------- */}
          <TabsContent value="favorites">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full p-4">
              <p className="text-sm text-muted-foreground">Favorites go here.</p>
            </section>
          </TabsContent>

          {/* -------------------- TRANSACTIONS -------------------- */}
          <TabsContent value="transactions">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full p-4">
              <Tabs defaultValue="active" className="w-full">
                <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
                  <TabsList className="flex bg-transparent h-auto">
                    <TabsTrigger value="active" className="tab-trigger">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="tab-trigger">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="tab-trigger">
                      Cancelled
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
                        Type <ChevronDown className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Purchases</DropdownMenuItem>
                        <DropdownMenuItem>Sales</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                      type="text"
                      placeholder="Search items"
                      className="h-9 w-[200px] text-sm"
                    />
                    <AdvancedFilters onApply={(f) => console.log("Transaction filters:", f)} />
                  </div>
                </div>

                <TabsContent value="active">
                  <p className="text-sm text-muted-foreground p-4">
                    Active transactions go here.
                  </p>
                </TabsContent>
                <TabsContent value="completed">
                  <p className="text-sm text-muted-foreground p-4">
                    Completed transactions go here.
                  </p>
                </TabsContent>
                <TabsContent value="cancelled">
                  <p className="text-sm text-muted-foreground p-4">
                    Cancelled transactions go here.
                  </p>
                </TabsContent>
              </Tabs>
            </section>
          </TabsContent>

          {/* -------------------- REVIEWS -------------------- */}
          <TabsContent value="reviews">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full p-4">
              <p className="text-sm text-muted-foreground">Reviews go here.</p>
            </section>
          </TabsContent>

          {/* -------------------- SETTINGS -------------------- */}
          <TabsContent value="settings">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full p-4">
              <SettingsPanel />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
