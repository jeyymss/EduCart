"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { FavoritesList } from "@/components/profile/FavoriteList";
import Transactions from "@/components/profile/Transactions";

const AVATAR_DIM = 128;

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);

  const [localUser, setLocalUser] = useState<typeof user | null>(null);
  const displayUser = (localUser ?? user) as typeof user & {
    coverX?: number;
    coverY?: number;
  };

  const [activeTab, setActiveTab] = useState("listings");
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveTab(hash);
  }, []);
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  const [activeSubTab, setActiveSubTab] = useState<
    "all" | "listed" | "sold" | "unlisted"
  >("all");

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
  if (!displayUser) return null;

  const renderTabContent = (
    key: "all" | "listed" | "sold" | "unlisted",
    status?: "Listed" | "Sold" | "Unlisted"
  ) => {
    const { postType, search, adv } = filtersByTab[key];
    return (
      <div className="p-4">
        <UserPosts
          userId={displayUser.id}
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
    updateFilters(tab, { postType: value, adv: { ...currentAdv, posts: [] } });
  };

  const coverObjectPosition = `${displayUser.coverX ?? 50}% ${
    displayUser.coverY ?? 50
  }%`;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="pb-8">
        {isEditing ? (
          <EditProfile
            userId={displayUser.id}
            role={
              displayUser.role === "Organization"
                ? "organization"
                : "individual"
            }
            currentAvatar={displayUser.avatar_url}
            currentBackground={displayUser.background_url}
            currentBio={displayUser.bio}
            onDone={(updated) => {
              setIsEditing(false);
              if (updated) {
                setLocalUser(
                  (prev) =>
                    ({
                      ...(prev ?? displayUser),
                      ...updated,
                    } as typeof user)
                );
              }
              router.refresh();
            }}
          />
        ) : (
          <div className="relative">
            {/* Taller cover */}
            <div className="relative w-full h-60 md:h-80 lg:h-96 overflow-hidden">
              <Image
                src={displayUser.background_url ?? "/placeholder-bg.jpg"}
                alt="Background"
                fill
                className="object-cover"
                style={{ objectPosition: coverObjectPosition }}
                priority
              />
              {/* Edit Profile button slightly lower */}
              <div className="absolute top-10 right-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Header strip under the cover */}
            <div className="bg-white shadow-sm px-6 pb-4">
              <div className="flex items-start justify-between gap-4 pl-6">
                {/* Left: avatar + name/bio */}
                <div className="flex items-start gap-4">
                  <div
                    className="relative -mt-16 rounded-full ring-4 ring-white shadow-md overflow-hidden"
                    style={{ width: AVATAR_DIM, height: AVATAR_DIM }}
                  >
                    <Image
                      src={displayUser?.avatar_url ?? "/placeholder-avatar.png"}
                      alt="Avatar"
                      width={AVATAR_DIM}
                      height={AVATAR_DIM}
                      className="h-full w-full object-cover"
                      unoptimized
                      priority
                    />
                  </div>

                  <div className="flex-1 mt-2">
                    <h1 className="text-2xl font-bold">
                      {displayUser.full_name ?? "Unnamed User"}
                    </h1>
                    <p className="text-base text-muted-foreground">
                      {displayUser.bio ?? "This user has no bio yet."}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {displayUser.role && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {displayUser.role}
                        </span>
                      )}
                      {displayUser.universities?.abbreviation && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {displayUser.universities.abbreviation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

               {/* Add Business Account */}
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="border-[#F3AD4B] text-[#F3AD4B] hover:bg-[#FFF7E9]"
                  onClick={() => {
                    console.log("Add Business Account clicked");
                  }}
                 >
                  Add Business Account
                </Button>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="sticky top-0 z-30 bg-white border-b">
            <TabsList className="flex w-full p-0 bg-transparent h-auto">
              {["listings", "favorites", "transactions", "reviews", "settings"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="tab-trigger px-4 py-3 rounded-none hover:cursor-pointer"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </div>

          <TabsContent value="listings">
            <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full overflow-hidden">
              <Tabs
                value={activeSubTab}
                onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}
                defaultValue="all"
                className="w-full"
              >
                <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
                  <TabsList className="flex bg-transparent h-auto">
                    <TabsTrigger value="all" className="tab-trigger">
                      All (
                      <UserPosts.Count
                        userId={displayUser.id}
                        postType={filtersByTab.all.postType}
                        search={filtersByTab.all.search}
                        filters={filtersByTab.all.adv}
                      />
                      )
                    </TabsTrigger>
                    <TabsTrigger value="listed" className="tab-trigger">
                      Listed (
                      <UserPosts.Count
                        userId={displayUser.id}
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
                        userId={displayUser.id}
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
                        userId={displayUser.id}
                        status="Unlisted"
                        postType={filtersByTab.unlisted.postType}
                        search={filtersByTab.unlisted.search}
                        filters={filtersByTab.unlisted.adv}
                      />
                      )
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
                        {filtersByTab[activeSubTab]?.postType ?? "Post Type"}
                        <ChevronDown className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[
                          "All",
                          "Sale",
                          "Rent",
                          "Trade",
                          "Emergency Lending",
                          "PasaBuy",
                          "Giveaway",
                        ].map((label) => (
                          <DropdownMenuItem
                            key={label}
                            onClick={() =>
                              setPostTypeAndClearAdvPosts(
                                activeSubTab,
                                label === "All" ? null : label
                              )
                            }
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
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

          <TabsContent value="favorites">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">My Favorites</h2>
              {displayUser?.id && <FavoritesList userId={displayUser.id} />}
            </section>
          </TabsContent>

          {/* ✅ transactions tab (no backend edits) */}
          <TabsContent value="transactions">
            <Transactions userId={displayUser.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <section className="border rounded-2xl bg-white shadow-sm p-4">
              Reviews go here.
            </section>
          </TabsContent>

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