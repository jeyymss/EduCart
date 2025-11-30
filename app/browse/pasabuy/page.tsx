"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

import { PasabuyCard } from "@/components/posts/displayposts/pasabuyCard";
import {
  useHomePagePasaBuy,
  type PasaBuyPost,
} from "@/hooks/queries/displayItems";

import SmartSearchBar from "@/components/search/SearchBar";
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

import PasabuyModal from "@/components/posts/itemDetails/PasabuyModal";

/* MOBILE NAV */
const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

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

export default function PasaBuyBrowsePage() {
  const {
    data: pasabuy = [],
    isLoading,
    error,
  } = useHomePagePasaBuy();

  const searchParams = useSearchParams();
  const initialSearch = (searchParams.get("search") ?? "").toString();

  const [postType, setPostType] = useState<ToolbarPost | null>("PasaBuy");
  const [search, setSearch] = useState(initialSearch);
  const [selectedPasaBuy, setSelectedPasaBuy] = useState<PasaBuyPost | null>(null);

  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  const filtered = useMemo(() => {
    if (!pasabuy) return [];

    return pasabuy.filter((it: PasaBuyPost) => {
      const title = it.item_title ?? "";

      if (search.trim() && !matchesSmartMulti(title, search.trim()))
        return false;

      /* Post Type Filter */
      if (postType && postType !== "All") {
        const current = asPostOpt(String(it.post_type_name));
        if (current !== postType) return false;
      }

      /* Advanced Post Type Filter */
      if (adv.posts.length > 0) {
        const current = asPostOpt(String(it.post_type_name));
        if (!current || !adv.posts.includes(current)) return false;
      }

      /* Category Filter */
      if (adv.category && adv.category !== "All Categories") {
        if (String(it.category_name) !== adv.category) return false;
      }

      /* Price Filter */
      const priceNum = getPrice((it as any).item_price);

      if (adv.minPrice != null && priceNum != null && priceNum < adv.minPrice)
        return false;

      if (adv.maxPrice != null && priceNum != null && priceNum > adv.maxPrice)
        return false;

      return true;
    });
  }, [pasabuy, postType, search, adv]);

  if (error) return <div className="p-10">Error: {(error as Error).message}</div>;

  const ItemsGrid = () => (
    <>
      {isLoading ? (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 sm:h-72 rounded-2xl bg-gray-100 animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 mt-12">
          <p className="text-lg font-medium">No items found</p>
        </div>
      ) : (
        <div
          className="
            grid gap-5 
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {filtered.map((post) => (
            <button
              key={post.post_id}
              type="button"
              onClick={() => setSelectedPasaBuy(post)}
              className="rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-lg text-left"
            >
              <PasabuyCard
                id={post.post_id}
                title={post.item_title}
                description={post.item_description}
                serviceFee={post.item_service_fee}
                created_at={post.created_at}
              />
            </button>
          ))}
        </div>
      )}

      {/* PASABUY MODAL */}
      <PasabuyModal
        post={selectedPasaBuy}
        onClose={() => setSelectedPasaBuy(null)}
      />
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

              {/* SmartSearchBar */}
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
                    <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-xl shadow ring-1 ring-black/10 text-[#102E4A] text-sm font-medium">
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
                              category: cat === "All Categories" ? undefined : cat,
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
            PasaBuy Posts
          </h1>
          <ItemsGrid />
        </main>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="w-full bg-[#102E4A]">
          <div className="mx-auto max-w-[1600px] px-6 md:px-8 py-6 md:py-8">

            <div className="flex justify-center">
              {/* ✔ SmartSearchBar */}
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
          <aside className="w-64 bg-white border-r p-6 sticky top-[90px] h-[calc(100vh-90px)] overflow-y-auto shadow-sm">
            <h2 className="font-semibold text-[#102E4A] mb-4">Filter Categories</h2>

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
                        category: cat === "All Categories" ? undefined : cat,
                      }))
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 px-10 lg:px-12 xl:px-16 pt-4">
            <h1 className="font-extrabold text-3xl text-[#102E4A] mb-4">
              PasaBuy Posts
            </h1>

            <ItemsGrid />
          </main>
        </div>
      </div>
    </div>
  );
}
