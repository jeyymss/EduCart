"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useOrganizationItems } from "@/hooks/queries/displayItems";
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

/* MOBILE TOP NAV */
const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

/* ---------------------- Post Type (same as Browse) ---------------------- */
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

/* -------------------------- Category rules (UI) ------------------------- */
type CategoryRule = { label: string; match: string[] };

const CATEGORY_RULES: CategoryRule[] = [
  { label: "All Categories", match: [] },
  { label: "Home & Furniture", match: ["Home & Furniture", "Home and Furniture"] },
  { label: "Pet Supplies", match: ["Pet Supplies"] },
  { label: "Sports", match: ["Sports"] },
  { label: "Electronics", match: ["Electronics"] },
  { label: "Academic", match: ["Academic", "Books & Supplies", "Books and Supplies"] },
  { label: "Clothing", match: ["Clothing", "Apparel"] },
  { label: "Beauty & Personal Care", match: ["Beauty & Personal Care", "Beauty", "Personal Care"] },
  { label: "Accessories", match: ["Accessories"] },
  { label: "Hobbies & Toys", match: ["Hobbies & Toys", "Toys", "Hobbies"] },
];

const CATEGORIES: string[] = CATEGORY_RULES.map((c) => c.label);

/* ------------------------------- Page ----------------------------------- */
export default function OrganizationPage() {
  const { data: items, isLoading, error } = useOrganizationItems();

  const [postType, setPostType] = useState<ToolbarPost | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();

    const withIndex = items.map((it, i) => ({ it, i }));

    return withIndex
      .filter(({ it }) => {
        if (postType && postType !== "All") {
          const current = asPostOpt(String(it.post_type_name));
          if (current !== postType) return false;
        }

        if (q) {
          const hay = `${it.item_title ?? ""} ${it.category_name ?? ""} ${
            it.organization_name ?? ""
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (adv.posts.length > 0) {
          const current = asPostOpt(String(it.post_type_name));
          if (!current || !adv.posts.includes(current)) return false;
        }

        if (selectedCategory && selectedCategory !== "All Categories") {
          const rule = CATEGORY_RULES.find(
            (c) => c.label === selectedCategory
          );
          if (rule) {
            const cat = String(it.category_name ?? "");
            const ok = rule.match.some(
              (m) => m.toLowerCase() === cat.toLowerCase()
            );
            if (!ok) return false;
          }
        }

        const priceNum = getPrice(it.item_price);
        if (
          adv.minPrice != null &&
          priceNum != null &&
          priceNum < adv.minPrice
        )
          return false;
        if (
          adv.maxPrice != null &&
          priceNum != null &&
          priceNum > adv.maxPrice
        )
          return false;

        return true;
      })
      .sort((A, B) => {
        const a = A.it;
        const b = B.it;

        if (adv.price) {
          const pa = getPrice(a.item_price);
          const pb = getPrice(b.item_price);
          const NA_LOW = Number.POSITIVE_INFINITY;
          const NA_HIGH = Number.NEGATIVE_INFINITY;
          const na = adv.price === "low" ? pa ?? NA_LOW : pa ?? NA_HIGH;
          const nb = adv.price === "low" ? pb ?? NA_LOW : pb ?? NA_HIGH;
          if (na !== nb) return adv.price === "low" ? na - nb : nb - na;
        }

        if (adv.time) {
          const ta = +new Date(a.created_at);
          const tb = +new Date(b.created_at);
          if (ta !== tb) return adv.time === "newest" ? tb - ta : ta - tb;
        }

        return A.i - B.i;
      })
      .map(({ it }) => it);
  }, [items, postType, search, adv, selectedCategory]);

  if (error)
    return (
      <div className="p-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );

  const handleSetCategory = (cat: string) => {
    setSelectedCategory(cat);
    setAdv((prev) => ({
      ...prev,
      category: cat === "All Categories" ? undefined : cat,
    }));
  };

  const handleAdvancedApply = (next: AdvancedFilterValue) => {
    setAdv({ ...next });
    if (next.category) {
      setSelectedCategory(next.category);
    } else {
      setSelectedCategory("All Categories");
    }
  };

  const SearchBar = () => (
    <div
      className="
        flex w-full max-w-4xl items-center
        gap-2 sm:gap-3
        rounded-full bg-white shadow-md
        ring-1 ring-black/10
        px-3 sm:px-4 py-1 sm:py-2
      "
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-1 px-3 py-1.5 rounded-full 
                     bg-[#E7F3FF] text-xs sm:text-sm font-medium text-[#102E4A] 
                     whitespace-nowrap hover:bg-[#d7e8ff]"
        >
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organization items..."
          className="h-9 sm:h-10 w-full border-none shadow-none 
                     px-0 sm:px-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
        />
      </div>

      <div className="flex-shrink-0">
        <AdvancedFilters value={adv} onApply={handleAdvancedApply} />
      </div>
    </div>
  );

  const Listings = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-gray-100 animate-pulse shadow-sm"
            />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center text-gray-600 mt-12">
          <p className="text-lg font-medium">No items found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <div
            key={item.post_id}
            className="transition-all duration-300 transform rounded-2xl hover:-translate-y-1 hover:shadow-lg bg-white"
          >
            <ItemCard
              id={item.post_id}
              condition={item.item_condition ?? ""}
              title={item.item_title}
              category_name={item.category_name ?? ""}
              image_urls={item.image_urls ?? []}
              price={item.item_price ?? undefined}
              post_type={item.post_type_name ?? ""}
              seller={item.organization_name}
              created_at={item.created_at}
              status={item.status}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden">
        <MobileTopNav />

        <div id="home-top-search-origin" className="w-full">
          <div
            id="home-top-search"
            className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#102E4A]"
          >
            <div className="mx-auto max-w-[1600px] px-4 py-3 pb-4">
              <div className="flex justify-center mb-3">
                <SearchBar />
              </div>

              {/* Mobile categories dropdown */}
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
                          onClick={() => handleSetCategory(cat)}
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

        {/* MOBILE MAIN CONTENT */}
        <main className="px-4 -mt-15 pb-28">
          <h1 className="font-extrabold text-2xl text-[#102E4A] mb-4">
            Organization Listings
          </h1>
          <Listings />
        </main>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block">
        <div id="home-top-search-origin" className="w-fluid">
          <div id="home-top-search" className="w-full bg-[#102E4A]">
            <div className="mx-auto max-w-[1600px] px-6 md:px-8 py-6 md:py-8">
              <div className="flex justify-center">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* LEFT SIDEBAR */}
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
                const active = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      active
                        ? "bg-[#eaf1fb] text-[#102E4A] font-medium"
                        : "hover:bg-[#f3f6fa]"
                    }`}
                    onClick={() => handleSetCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 px-10 lg:px-12 xl:px-16 pt-4 pb-10">
            <h1 className="font-extrabold text-3xl text-[#102E4A] mb-4">
              Organization Listings
            </h1>
            <Listings />
          </main>
        </div>
      </div>
    </div>
  );
}
