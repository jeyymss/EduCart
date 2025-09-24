"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserPosts } from "@/components/profile/UserPosts";
import type { AdvancedFilterValue } from "@/components/profile/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import { SettingsPanel } from "@/components/profile/SettingsPanel";
import EditProfile from "@/components/profile/EditProfile";
import Image from "next/image";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  // main profile tabs
  const [activeTab, setActiveTab] = useState("listings");
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveTab(hash);
  }, []);
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  // sub-tabs inside listings
  const [activeSubTab, setActiveSubTab] = useState<
    "all" | "listed" | "sold" | "unlisted"
  >("all");

  // filters per sub-tab
  type PerTab = {
    postType: string | null;
    search: string;
    adv: AdvancedFilterValue;
  };

  const EMPTY_ADV: AdvancedFilterValue = {
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  };

  const [filtersByTab, setFiltersByTab] = useState<
    Record<"all" | "listed" | "sold" | "unlisted", PerTab>
  >({
    all: { postType: null, search: "", adv: { ...EMPTY_ADV } },
    listed: { postType: null, search: "", adv: { ...EMPTY_ADV } },
    sold: { postType: null, search: "", adv: { ...EMPTY_ADV } },
    unlisted: { postType: null, search: "", adv: { ...EMPTY_ADV } },
  });

  const updateFilters = (
    tab: keyof typeof filtersByTab,
    updates: Partial<PerTab>
  ) => {
    setFiltersByTab((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...updates },
    }));
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Error: {(error as Error).message}
      </div>
    );
  if (!user) return null;

  const renderTabContent = (
    key: "all" | "listed" | "sold" | "unlisted",
    status?: "Listed" | "Sold" | "Unlisted"
  ) => {
    const { postType, search, adv } = filtersByTab[key];
    return (
      <div className="p-4">
        <UserPosts
          userId={user.id}
          status={status}
          postType={postType}
          search={search}
          filters={adv}
        />
      </div>
    );
  };

  const setPostTypeAndClearAdvPosts = (
    tab: keyof typeof filtersByTab,
    value: string | null
  ) => {
    const currentAdv = filtersByTab[tab].adv;
    updateFilters(tab, {
      postType: value,
      adv: { ...currentAdv, posts: [] },
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ---------- Profile Header ---------- */}
      <div className="pb-8">
        {isEditing ? (
          <EditProfile
            userId={user.id}
            role={user.role === "Organization" ? "organization" : "individual"}
            currentAvatar={user.avatar_url}
            currentBackground={user.background_url}
            currentBio={user.bio}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <div className="relative">
            {/* Background */}
            <div className="relative w-full h-40 md:h-60">
              <Image
                src={user.background_url ?? "/placeholder-bg.jpg"}
                alt="Background"
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Avatar + Info */}
            <div className="bg-white shadow-sm px-6 pb-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative -mt-16">
                  <Image
                    src={user?.avatar_url ?? "/placeholder-avatar.png"}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="rounded-full ring-4 ring-white object-cover shadow-md"
                  />
                </div>

                {/* User info */}
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
        )}
      </div>

      {/* ---------- Main Content ---------- */}
      <div className="flex-1 px-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="sticky top-0 z-30 bg-white border-b">
            <TabsList className="flex w-full p-0 bg-transparent h-auto">
              {[
                "listings",
                "favorites",
                "transactions",
                "reviews",
                "settings",
              ].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="tab-trigger px-4 py-3 rounded-none hover:cursor-pointer"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* -------------------- LISTINGS -------------------- */}
          <TabsContent value="listings">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full overflow-hidden">
              <Tabs
                value={activeSubTab}
                onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}
                defaultValue="all"
                className="w-full"
              >
                {/* Top toolbar row */}
                <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
                  {/* left: sub-tabs with counts */}
                  <TabsList className="flex bg-transparent h-auto">
                    <TabsTrigger value="all" className="tab-trigger">
                      All (
                      <UserPosts.Count
                        userId={user.id}
                        postType={filtersByTab.all.postType}
                        search={filtersByTab.all.search}
                        filters={filtersByTab.all.adv}
                      />
                      )
                    </TabsTrigger>
                    <TabsTrigger value="listed" className="tab-trigger">
                      Listed (
                      <UserPosts.Count
                        userId={user.id}
                        status="Listed"
                        postType={filtersByTab.listed.postType}
                        search={filtersByTab.listed.search}
                        filters={filtersByTab.listed.adv}
                      />
                      )
                    </TabsTrigger>
                    <TabsTrigger value="sold" className="tab-trigger">
                      Sold (
                      <UserPosts.Count
                        userId={user.id}
                        status="Sold"
                        postType={filtersByTab.sold.postType}
                        search={filtersByTab.sold.search}
                        filters={filtersByTab.sold.adv}
                      />
                      )
                    </TabsTrigger>
                    <TabsTrigger value="unlisted" className="tab-trigger">
                      Unlisted (
                      <UserPosts.Count
                        userId={user.id}
                        status="Unlisted"
                        postType={filtersByTab.unlisted.postType}
                        search={filtersByTab.unlisted.search}
                        filters={filtersByTab.unlisted.adv}
                      />
                      )
                    </TabsTrigger>
                  </TabsList>

                  {/* right: filters */}
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
                        {filtersByTab[activeSubTab]?.postType ?? "Post Type"}
                        <ChevronDown className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(activeSubTab, null)
                          }
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(activeSubTab, "Sale")
                          }
                        >
                          Sale
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(activeSubTab, "Rent")
                          }
                        >
                          Rent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(activeSubTab, "Trade")
                          }
                        >
                          Trade
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(
                              activeSubTab,
                              "Emergency Lending"
                            )
                          }
                        >
                          Emergency Lending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(activeSubTab, "Pasabuy")
                          }
                        >
                          Pasabuy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPostTypeAndClearAdvPosts(
                              activeSubTab,
                              "Giveaway"
                            )
                          }
                        >
                          Giveaway
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Input
                      type="text"
                      placeholder="Search items"
                      className="h-9 w-[200px] text-sm"
                      value={filtersByTab[activeSubTab]?.search ?? ""}
                      onChange={(e) =>
                        updateFilters(activeSubTab, { search: e.target.value })
                      }
                    />

                    {/* ✅ Advanced Filters (controlled) */}
                    <AdvancedFilters
                      value={filtersByTab[activeSubTab]?.adv}
                      onApply={(adv) =>
                        updateFilters(activeSubTab, {
                          adv: { ...adv, posts: [...(adv.posts ?? [])] },
                        })
                      }
                    />
                  </div>
                </div>

                {/* sub-tab content */}
                <TabsContent value="all">{renderTabContent("all")}</TabsContent>
                <TabsContent value="listed">
                  {renderTabContent("listed", "Listed")}
                </TabsContent>
                <TabsContent value="sold">
                  {renderTabContent("sold", "Sold")}
                </TabsContent>
                <TabsContent value="unlisted">
                  {renderTabContent("unlisted", "Unlisted")}
                </TabsContent>
              </Tabs>
            </section>
          </TabsContent>

          {/* -------------------- FAVORITES -------------------- */}
          <TabsContent value="favorites">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              Favorites go here.
            </section>
          </TabsContent>

          {/* -------------------- TRANSACTIONS -------------------- */}
          <TabsContent value="transactions">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              Transactions go here.
            </section>
          </TabsContent>

          {/* -------------------- REVIEWS -------------------- */}
          <TabsContent value="reviews">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              Reviews go here.
            </section>
          </TabsContent>

          {/* -------------------- SETTINGS -------------------- */}
          <TabsContent value="settings">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              <SettingsPanel />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
