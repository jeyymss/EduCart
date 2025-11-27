"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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

/* MOBILE TOP NAV */
const MobileTopNav = dynamic(
  () => import("@/components/mobile/MobileTopNav"),
  { ssr: false }
);

/* TYPES & OPTIONS */
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

export default function BusinessPage() {
  const [postType, setPostType] = useState<ToolbarPost | null>(null);
  const [search, setSearch] = useState("");
  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

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
          placeholder="Search business items..."
          className="h-9 sm:h-10 w-full border-none shadow-none 
                     px-0 sm:px-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
        />
      </div>

      <div className="flex-shrink-0">
        <AdvancedFilters value={adv} onApply={(next) => setAdv({ ...next })} />
      </div>
    </div>
  );

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

        {/* MOBILE MAIN CONTENT */}
        <main className="px-4 -mt-15 pb-28">
          <h1 className="font-extrabold text-2xl text-[#102E4A] mb-4">
            Business Listings
          </h1>

          {/* Placeholder message */}
          <div className="text-center text-gray-600 mt-12">
            <p className="text-lg font-medium">No business listings available yet</p>
          </div>
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

          {/* MAIN CONTENT */}
          <main className="flex-1 px-10 lg:px-12 xl:px-16 pt-4">
            <h1 className="font-extrabold text-3xl text-[#102E4A] mb-4">
              Business Listings
            </h1>

            <div className="text-center text-gray-600 mt-12">
              <p className="text-lg font-medium">No business listings available yet</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
