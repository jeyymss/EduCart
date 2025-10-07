"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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

/* ---------------------- Post Type Options ---------------------- */
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

/* -------------------------- Category rules -------------------------- */
const CATEGORY_RULES = [
  { label: "All Categories" },
  { label: "Home & Furniture" },
  { label: "Pet Supplies" },
  { label: "Sports" },
  { label: "Electronics" },
  { label: "Academic" },
  { label: "Clothing" },
  { label: "Beauty & Personal Care" },
  { label: "Accessories" },
  { label: "Hobbies & Toys" },
];

/* ----------------------------- Page ----------------------------- */
export default function BusinessPage() {
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

      <main className="flex-1 p-6 md:p-10 space-y-8">
        <div
          className="sticky z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm px-2 md:px-4 py-3 rounded-md"
          style={{ top: "calc(var(--app-header-h))" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-3">
              {/* Post Type Dropdown */}
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

              {/* Search Bar */}
              <Input
                type="text"
                placeholder="Search business items..."
                className="h-10 w-[260px] text-sm shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Advanced Filters */}
              <AdvancedFilters value={adv} onApply={(next) => setAdv({ ...next })} />
            </div>
          </div>
        </div>

        <section>
          <h1 className="font-bold text-2xl text-[#102E4A] mb-6">Business Listings</h1>
          <div className="text-center text-gray-600 mt-12">
            <p className="text-lg font-medium">No business listings available yet</p>
          </div>
        </section>
      </main>
    </div>
  );
}
