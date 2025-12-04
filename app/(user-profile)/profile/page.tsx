"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import type { AdvancedFilterValue } from "@/components/profile/AdvancedFilters";
import { SettingsPanel } from "@/components/profile/SettingsPanel";
import EditProfile from "@/components/profile/EditProfile";
import { FavoritesList } from "@/components/profile/FavoriteList";
import Transactions from "@/components/profile/Transactions";
import { UserPosts } from "@/components/profile/UserPosts";
import UserReviews from "@/components/profile/UserReviews";
import MobileTopNav from "@/components/mobile/MobileTopNav";

import AddBusinessModal from "@/components/profile/AddBusinessModal";

const AVATAR_DIM = 96;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: EASE } },
};

const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isEditing) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isEditing]);

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
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="p-3 md:p-4">
          <UserPosts
            userId={displayUser.id}
            status={status}
            postType={postType}
            search={search}
            filters={adv}
          />
        </div>
      </motion.div>
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
      <div className="pb-6 md:pb-8">
        {isEditing ? (
          <EditProfile
            userId={displayUser.id}
            role={
              displayUser.role === "Organization" ? "organization" : "individual"
            }
            currentAvatar={displayUser.avatar_url}
            currentBackground={displayUser.background_url}
            currentBio={displayUser.bio}
            onDone={(updated) => {
              setIsEditing(false);
              if (updated) {
                setLocalUser(
                  (prev: any) =>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: EASE } }}
          >
            {/* Cover */}
            <div className="relative w-full h-52 md:h-80 lg:h-96 overflow-hidden">
              <motion.div
                initial={{ scale: 1.04 }}
                animate={{
                  scale: 1,
                  transition: { duration: 0.6, ease: EASE },
                }}
                className="absolute inset-0"
              >
                <Image
                  src={displayUser.background_url ?? "/gray.jpg"}
                  alt="Background"
                  fill
                  className="object-cover"
                  style={{ objectPosition: coverObjectPosition }}
                  priority
                />
              </motion.div>

              {/* Edit Profile button */}
              <motion.div
                className="absolute top-4 right-4 md:top-10"
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.25, ease: EASE },
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </motion.div>
            </div>

            {/* Header Strip */}
            <motion.div
              className="bg-white shadow-sm px-4 md:px-6 pb-4"
              variants={fadeUp}
              initial="initial"
              animate="animate"
            >
              <div className="flex flex-col md:flex-row items-start md:items-start justify-start md:justify-between gap-4 md:pl-6">
                {/* Left: avatar + name */}
                <div className="flex items-start gap-3 md:gap-4 w-full">
                  <motion.div
                    className="relative -mt-12 md:-mt-16 rounded-full ring-4 ring-white shadow-md overflow-hidden w-24 h-24 md:w-[128px] md:h-[128px]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                      },
                    }}
                  >
                    <Image
                      src={displayUser?.avatar_url ?? "/avatarplaceholder.png"}
                      alt="Avatar"
                      width={AVATAR_DIM}
                      height={AVATAR_DIM}
                      className="h-full w-full object-cover"
                      unoptimized
                      priority
                    />
                  </motion.div>

                  <div className="flex-1 mt-1 md:mt-2">
                    <h1 className="text-xl md:text-2xl font-bold">
                      {displayUser.full_name ?? "Unnamed User"}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {displayUser.bio ?? "This user has no bio yet."}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
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

                {/* Add Business Account Modal */}
                <motion.div
                  className="mt-3 md:mt-2 w-full md:w-auto flex justify-end md:justify-start"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <AddBusinessModal />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-4">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Sticky tabs bar */}
          <div
            className={[
              "sticky top-0 z-30 bg-white border-b transition-opacity",
              isEditing
                ? "opacity-60 pointer-events-none select-none"
                : "opacity-100",
            ].join(" ")}
          >
            <div className="overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="inline-flex min-w-max p-0 bg-transparent h-auto">
                {["listings", "favorites", "transactions", "reviews", "settings"].map(
                  (tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="tab-trigger px-4 py-3 rounded-none hover:cursor-pointer relative flex-shrink-0 text-sm md:text-base"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {!isEditing && activeTab === tab && (
                        <motion.span
                          layoutId="profile-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/80"
                        />
                      )}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </div>
          </div>

          {/* CONTENT WRAPPER */}
          <div
            className={[
              "transition-opacity",
              isEditing
                ? "opacity-50 pointer-events-none select-none"
                : "opacity-100",
            ].join(" ")}
            aria-hidden={isEditing}
          >
            {/* LISTINGS */}
            <TabsContent value="listings">
              <section className="border border-gray-300 rounded-2xl bg-white shadow-sm w-full overflow-hidden">
                <Tabs
                  value={activeSubTab}
                  onValueChange={(v) =>
                    setActiveSubTab(v as typeof activeSubTab)
                  }
                  defaultValue="all"
                  className="w-full"
                >
                  {/* Sub-tab Filters */}
                  <motion.div
                    className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b flex flex-col gap-2 px-3 py-2 md:flex-row md:justify-between md:items-center md:gap-4 md:px-4"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                  >
                    {/* Sub-tabs */}
                    <div className="w-full md:w-auto overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <TabsList className="flex bg-transparent h-auto">
                        <TabsTrigger
                          value="all"
                          className="tab-trigger hover:cursor-pointer flex-shrink-0 text-sm md:text-base"
                        >
                          All (
                          <UserPosts.Count
                            userId={displayUser.id}
                            postType={filtersByTab.all.postType}
                            search={filtersByTab.all.search}
                            filters={filtersByTab.all.adv}
                          />
                          )
                        </TabsTrigger>

                        <TabsTrigger
                          value="listed"
                          className="tab-trigger hover:cursor-pointer flex-shrink-0 text-sm md:text-base"
                        >
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

                        <TabsTrigger
                          value="sold"
                          className="tab-trigger hover:cursor-pointer flex-shrink-0 text-sm md:text-base"
                        >
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

                        <TabsTrigger
                          value="unlisted"
                          className="tab-trigger hover:cursor-pointer flex-shrink-0 text-sm md:text-base"
                        >
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
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:items-center md:gap-3">
                      {/* Post Type Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-between gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50 w-full md:w-auto">
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

                      {/* Search + Advanced Filters */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Input
                          type="text"
                          placeholder="Search items"
                          className="h-9 w-full md:w-[200px] text-sm"
                          value={filtersByTab[activeSubTab]?.search ?? ""}
                          onChange={(e) =>
                            updateFilters(activeSubTab, {
                              search: e.target.value,
                            })
                          }
                        />

                        <div className="flex-shrink-0 flex justify-end md:justify-start">
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
                    </div>
                  </motion.div>

                  {/* Animated Sub-Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeSubTab === "all" && (
                      <motion.div
                        key="all"
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {renderTabContent("all")}
                      </motion.div>
                    )}

                    {activeSubTab === "listed" && (
                      <motion.div
                        key="listed"
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {renderTabContent("listed", "Listed")}
                      </motion.div>
                    )}

                    {activeSubTab === "sold" && (
                      <motion.div
                        key="sold"
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {renderTabContent("sold", "Sold")}
                      </motion.div>
                    )}

                    {activeSubTab === "unlisted" && (
                      <motion.div
                        key="unlisted"
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {renderTabContent("unlisted", "Unlisted")}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Tabs>
              </section>
            </TabsContent>
            {/* FAVORITES */}
            <TabsContent value="favorites">
              <motion.section
                className="border rounded-2xl bg-white shadow-sm p-4"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-lg font-semibold mb-4">My Favorites</h2>

                {displayUser?.id && <FavoritesList userId={displayUser.id} />}
              </motion.section>
            </TabsContent>

            {/* TRANSACTIONS */}
            <TabsContent value="transactions">
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Transactions userId={displayUser.id} />
              </motion.div>
            </TabsContent>

            {/* REVIEWS */}
            <TabsContent value="reviews">
              <motion.section
                className="border rounded-2xl bg-white shadow-sm p-4"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-lg font-semibold mb-4">My Reviews</h2>

                <UserReviews userId={displayUser.id} />
              </motion.section>
            </TabsContent>

            {/* SETTINGS */}
            <TabsContent value="settings">
              <motion.section
                className="border rounded-2xl bg-white shadow-sm p-4"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <SettingsPanel />
              </motion.section>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileTopNav />
      </div>
    </div>
  );
}
