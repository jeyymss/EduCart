"use client";

import { useMemo, useState } from "react";
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

/* ------------------------------- Page ----------------------------------- */
export default function OrganizationPage() {
  const { data: items, isLoading, error } = useOrganizationItems();

  const [postType, setPostType] = useState<ToolbarPost | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
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
          const hay = `${it.item_title ?? ""} ${it.category_name ?? ""} ${it.organization_name ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (adv.posts.length > 0) {
          const current = asPostOpt(String(it.post_type_name));
          if (!current || !adv.posts.includes(current)) return false;
        }

        if (selectedCategory && selectedCategory !== "All Categories") {
          const rule = CATEGORY_RULES.find((c) => c.label === selectedCategory);
          if (rule) {
            const cat = String(it.category_name ?? "");
            const ok = rule.match.some((m) => m.toLowerCase() === cat.toLowerCase());
            if (!ok) return false;
          }
        }

        const priceNum = getPrice(it.item_price);
        if (adv.minPrice != null && priceNum != null && priceNum < adv.minPrice) return false;
        if (adv.maxPrice != null && priceNum != null && priceNum > adv.maxPrice) return false;

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
          const na = adv.price === "low" ? (pa ?? NA_LOW) : (pa ?? NA_HIGH);
          const nb = adv.price === "low" ? (pb ?? NA_LOW) : (pb ?? NA_HIGH);
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

  if (error) return <div className="p-10 text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT: Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r shadow-sm p-6 sticky top-[calc(var(--app-header-h)+8px)] h-[calc(100vh-88px)] overflow-y-auto">
        <h2 className="font-semibold text-[#102E4A] mb-4">Filter Categories</h2>
        <nav className="space-y-1 text-sm" aria-label="Categories">
          {CATEGORY_RULES.map((c) => {
            const active = selectedCategory === c.label;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => setSelectedCategory(c.label)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-[#ebf2ff] text-[#102E4A] font-medium"
                    : "hover:bg-[#f3f6fa]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {c.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT: Main content */}
      <main className="flex-1 p-6 md:p-10 space-y-8">
        {/* Sticky toolbar */}
        <div
          className="sticky z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm px-2 md:px-4 py-3 rounded-md"
          style={{ top: "calc(var(--app-header-h))" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50 transition">
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

              <Input
                type="text"
                placeholder="Search organization items..."
                className="h-10 w-[260px] text-sm shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <AdvancedFilters value={adv} onApply={(next) => setAdv({ ...next })} />
            </div>
          </div>
        </div>

        {/* Listings */}
        <section>
          <h1 className="font-bold text-2xl text-[#102E4A] mb-6">Organization Listings</h1>

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-600 mt-12">
              <p className="text-lg font-medium">No items found</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          )}
        </section>
      </main>
    </div>
  );
}
