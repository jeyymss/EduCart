"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import {
  useHomePageEmergency,
  type EmergencyPost,
} from "@/hooks/queries/displayItems";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import {
  AdvancedFilters,
  type AdvancedFilterValue,
  type PostOpt,
} from "@/components/profile/AdvancedFilters";

const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

import EmergencyModal from "@/components/posts/itemDetails/EmergencyModal";

/* TYPES */
type ToolbarPost = "All" | PostOpt;

const POST_TYPE_OPTIONS: ToolbarPost[] = [
  "All",
  "Sale",
  "Rent",
  "Trade",
  "Emergency Lending",
  "PasaBuy",
  "Donation and Giveaway",
];

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

function asPostOpt(s: string): PostOpt | null {
  const map: Record<string, PostOpt> = {
    Sale: "Sale",
    Rent: "Rent",
    Trade: "Trade",
    "Emergency Lending": "Emergency Lending",
    PasaBuy: "PasaBuy",
    "Donation and Giveaway": "Donation and Giveaway",
  };
  return map[s] ?? null;
}

function getPrice(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

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

  /* ⭐ MODAL STATE */
  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyPost | null>(null);

  /* FILTERED RESULTS */
  const filtered = useMemo(() => {
    if (!emergency) return [];
    const q = search.trim().toLowerCase();
    const withIndex = emergency.map((it: EmergencyPost, i) => ({ it, i }));

    return withIndex
      .filter(({ it }) => {
        if (postType && postType !== "All") {
          const current = asPostOpt(String(it.post_type_name));
          if (current !== postType) return false;
        }

        if (q) {
          const hay = `${it.item_title ?? ""} ${it.category_name ?? ""} ${
            it.full_name ?? ""
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
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
      })
      .map(({ it }) => it);
  }, [emergency, postType, search, adv]);

  if (error)
    return <div className="p-10">Error: {(error as Error).message}</div>;

  /* SEARCH BAR */
  const SearchBar = () => (
    <div className="flex w-full max-w-4xl items-center gap-2 sm:gap-3 rounded-full bg-white shadow-md ring-1 ring-black/10 px-3 sm:px-4 py-1 sm:py-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E7F3FF] text-xs sm:text-sm font-medium text-[#102E4A] hover:bg-[#d7e8ff] whitespace-nowrap">
          {postType ?? "All Types"}
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {POST_TYPE_OPTIONS.map((label) => (
            <DropdownMenuItem
              key={label}
              onClick={() => setPostType(label === "All" ? null : label)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 hidden sm:block" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything..."
          className="h-9 sm:h-10 w-full border-none shadow-none px-0 sm:px-1 text-sm focus-visible:ring-0"
          autoComplete="off"
        />
      </div>

      <AdvancedFilters value={adv} onApply={(next) => setAdv({ ...next })} />
    </div>
  );

  /* ITEMS GRID */
  const ItemsGrid = () => (
    <>
      {isLoading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
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
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
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

        <div className="w-full">
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#102E4A]">
            <div className="mx-auto max-w-[1600px] px-4 py-3 pb-4">
              <div className="flex justify-center mb-3">
                <SearchBar />
              </div>

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
        <div className="w-full bg-[#102E4A]">
          <div className="mx-auto max-w-[1600px] px-6 md:px-8 py-6 md:py-8">
            <div className="flex justify-center">
              <SearchBar />
            </div>
          </div>
        </div>

        <div className="flex">
          <aside className="w-64 bg-white border-r p-6 sticky top-[90px] h-[calc(100vh-90px)] overflow-y-auto shadow-sm">
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

          <main className="flex-1 px-10 lg:px-12 xl:px-16 pt-4">
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
