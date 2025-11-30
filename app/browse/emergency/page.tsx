"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import {
  useHomePageEmergency,
  type EmergencyPost,
} from "@/hooks/queries/displayItems";

import SmartSearchBar from "@/components/search/SearchBar"; // ⭐ SAME SEARCH BAR AS BROWSE
import {
  matchesSmartMulti,
  asPostOpt,
  getPrice,
} from "@/hooks/useSmartSearch";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AdvancedFilters,
  type AdvancedFilterValue,
  type PostOpt,
} from "@/components/profile/AdvancedFilters";

/* MOBILE NAV */
const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

import EmergencyModal from "@/components/posts/itemDetails/EmergencyModal";

/* TYPES */
type ToolbarPost = "All" | PostOpt;

const CATEGORIES: string[] = [
  "All Categories",
  "Home & Furniture",
  "Pet Supplies",
  "Sports",
  "Electronics",
  "Academic",
  "Clothing",
  "Beauty & Personal Care",
  "Accessories",
  "Hobbies & Toys",
];

export default function EmergencyBrowsePage() {
  const {
    data: emergency = [],
    isLoading,
    error,
  } = useHomePageEmergency();

  const searchParams = useSearchParams();
  const initialSearch = (searchParams.get("search") ?? "").toString();

  const [postType, setPostType] =
    useState<ToolbarPost | null>("Emergency Lending");

  const [search, setSearch] = useState(initialSearch);

  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyPost | null>(null);

  /* FILTERED RESULTS */
  const filtered = useMemo(() => {
    return emergency.filter((it) => {
      const title = it.item_title ?? "";

      if (search.trim() && !matchesSmartMulti(title, search.trim()))
        return false;

      if (postType && postType !== "All") {
        const current = asPostOpt(String(it.post_type_name));
        if (current !== postType) return false;
      }

      if (adv.posts.length > 0) {
        const current = asPostOpt(String(it.post_type_name));
        if (!current || !adv.posts.includes(current)) return false;
      }

      if (adv.category && adv.category !== "All Categories") {
        if (String(it.category_name) !== adv.category) return false;
      }

      const priceNum = getPrice((it as any).item_price);

      if (adv.minPrice != null && priceNum != null && priceNum < adv.minPrice)
        return false;

      if (adv.maxPrice != null && priceNum != null && priceNum > adv.maxPrice)
        return false;

      return true;
    });
  }, [emergency, search, postType, adv]);

  if (error)
    return <div className="p-10">Error: {(error as Error).message}</div>;

  /* GRID */
  const ItemsGrid = () => (
    <>
      {isLoading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 sm:h-72 rounded-2xl bg-gray-100 animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 mt-12">
          <p className="text-lg font-medium">No emergency posts found</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((emg) => (
            <button
              key={emg.post_id}
              type="button"
              onClick={() => setSelectedEmergency(emg)}
              className="text-left rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-lg"
            >
              <EmergencyCard
                id={emg.post_id}
                title={emg.item_title}
                description={emg.item_description}
                isUrgent={emg.post_type_name === "Emergency Lending"}
                created_at={emg.created_at}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white min-h-screen">

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileTopNav />

        <div id="home-top-search-origin" className="w-full">
          <div
            id="home-top-search"
            className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#102E4A]"
          >
            <div className="mx-auto max-w-[1600px] px-4 py-3 pb-4">

              {/* SMART SEARCH BAR */}
              <div className="flex justify-center mb-3">
                <SmartSearchBar
                  search={search}
                  setSearch={setSearch}
                  postType={postType}
                  setPostType={setPostType}
                  adv={adv}
                  setAdv={setAdv}
                />
              </div>

              {/* CATEGORY DROPDOWN */}
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="
                        w-full flex items-center justify-between px-4 py-2 
                        bg-white rounded-xl shadow ring-1 ring-black/10 
                        text-[#102E4A] text-sm font-medium
                      "
                    >
                      {adv.category ?? "All Categories"}
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-full max-w-4xl">
                      {CATEGORIES.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onClick={() =>
                            setAdv((prev) => ({
                              ...prev,
                              category:
                                cat === "All Categories" ? undefined : cat,
                            }))
                          }
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

            </div>
          </div>
        </div>

        <main className="px-4 -mt-15 pb-28">
          <h1 className="font-extrabold text-2xl text-[#102E4A] mb-4">
            Emergency Buying
          </h1>
          <ItemsGrid />
        </main>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div id="home-top-search" className="w-full bg-[#102E4A]">
          <div className="mx-auto max-w-[1600px] px-6 py-8">
            <div className="flex justify-center">
              <SmartSearchBar
                search={search}
                setSearch={setSearch}
                postType={postType}
                setPostType={setPostType}
                adv={adv}
                setAdv={setAdv}
              />
            </div>
          </div>
        </div>

        <div className="flex">
          <aside
            className="
              w-64 bg-white border-r p-6 
              sticky top-[90px] h-[calc(100vh-90px)] overflow-y-auto shadow-sm
            "
          >
            <h2 className="font-semibold text-[#102E4A] mb-4">
              Filter Categories
            </h2>

            <nav className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => {
                const active = (adv.category ?? "All Categories") === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      active
                        ? "bg-[#eaf1fb] text-[#102E4A] font-medium"
                        : "hover:bg-[#f3f6fa]"
                    }`}
                    onClick={() =>
                      setAdv((prev) => ({
                        ...prev,
                        category:
                          cat === "All Categories" ? undefined : cat,
                      }))
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 px-10 pt-4">
            <h1 className="font-extrabold text-3xl text-[#102E4A] mb-4">
              Emergency Buying
            </h1>
            <ItemsGrid />
          </main>
        </div>
      </div>

      <EmergencyModal
        post={selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
      />
    </div>
  );
}
