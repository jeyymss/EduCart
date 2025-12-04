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
            excludeSold={key === "all"}  // ⭐ HIDE SOLD IN ALL TAB
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
      {/* Cover + Profile Info */}
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

              <motion.div
                className="absolute top-4 right-4 md:top-10"
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.25, ease: EASE },
                }}
              >
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div
            className={[
              "sticky top-0 z-30 bg-white border-b transition-opacity",
              isEditing
                ? "opacity-60 pointer-events-none select-none"
                : "opacity-100",
            ].join(" ")}
          >
            <div className="overflow-x-auto whitespace-nowrap">
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

          <div
            className={[
              "transition-opacity",
              isEditing ? "opacity-50 pointer-events-none" : "opacity-100",
            ].join(" ")}
          >
            {/* LISTINGS */}
            <TabsContent value="listings">
              <section className="border rounded-2xl bg-white shadow-sm w-full overflow-hidden">
                <Tabs
                  value={activeSubTab}
                  onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}
                  defaultValue="all"
                  className="w-full"
                >
                  {/* Subtabs */}
                  <motion.div
                    className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-3 py-2"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                  >
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
                  </motion.div>

                  {/* Subtab Content */}
                  <AnimatePresence mode="wait">
                    {activeSubTab === "all" && (
                      <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                        {renderTabContent("all")}
                      </motion.div>
                    )}

                    {activeSubTab === "listed" && (
                      <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                        {renderTabContent("listed", "Listed")}
                      </motion.div>
                    )}

                    {activeSubTab === "sold" && (
                      <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                        {renderTabContent("sold", "Sold")}
                      </motion.div>
                    )}

                    {activeSubTab === "unlisted" && (
                      <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                        {renderTabContent("unlisted", "Unlisted")}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Tabs>
              </section>
            </TabsContent>

            {/* FAVORITES */}
            <TabsContent value="favorites">
              <motion.section className="border rounded-2xl bg-white shadow-sm p-4" variants={fadeUp}>
                <h2 className="text-lg font-semibold mb-4">My Favorites</h2>
                {displayUser?.id && <FavoritesList userId={displayUser.id} />}
              </motion.section>
            </TabsContent>

            {/* TRANSACTIONS */}
            <TabsContent value="transactions">
              <motion.div variants={fadeUp} initial="initial" animate="animate" exit="exit">
                <Transactions userId={displayUser.id} />
              </motion.div>
            </TabsContent>

            {/* REVIEWS */}
            <TabsContent value="reviews">
              <motion.section className="border rounded-2xl bg-white shadow-sm p-4" variants={fadeUp}>
                <h2 className="text-lg font-semibold mb-4">My Reviews</h2>
                <UserReviews userId={displayUser.id} />
              </motion.section>
            </TabsContent>

            {/* SETTINGS */}
            <TabsContent value="settings">
              <motion.section className="border rounded-2xl bg-white shadow-sm p-4" variants={fadeUp}>
                <SettingsPanel />
              </motion.section>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="md:hidden">
        <MobileTopNav />
      </div>
    </div>
  );
}
