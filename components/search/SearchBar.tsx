"use client";

import { useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
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

/* TYPES */
export type ToolbarPost = "All" | PostOpt;

interface SmartSearchBarProps {
  search: string;
  setSearch: (v: string) => void;

  postType: ToolbarPost | null;
  setPostType: (v: ToolbarPost | null) => void;

  adv: AdvancedFilterValue;
  setAdv: (v: AdvancedFilterValue) => void;
}

/* POST TYPE OPTIONS */
const POST_TYPE_OPTIONS: ToolbarPost[] = [
  "All",
  "Sale",
  "Rent",
  "Trade",
  "Emergency Lending",
  "PasaBuy",
  "Donation and Giveaway",
];

export default function SmartSearchBar({
  search,
  setSearch,
  postType,
  setPostType,
  adv,
  setAdv,
}: SmartSearchBarProps) {

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="
        flex w-full max-w-4xl items-center
        gap-2 sm:gap-3
        rounded-full bg-white shadow-md
        ring-1 ring-black/10
        px-3 sm:px-4 py-1 sm:py-2
      "
    >
      {/* POST TYPE DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="
            flex items-center gap-1 px-3 py-1.5 rounded-full 
            bg-[#E7F3FF] text-xs sm:text-sm font-medium text-[#102E4A] 
            whitespace-nowrap hover:bg-[#d7e8ff]
          "
        >
          {postType ?? "All Types"}
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {POST_TYPE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => setPostType(opt === "All" ? null : opt)}
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* SEARCH FIELD */}
      <div className="flex-1 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 hidden sm:block" />

        <Input
          ref={searchInputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);

            setTimeout(() => {
              searchInputRef.current?.focus();
            }, 0);
          }}
          placeholder="Search anything..."
          className="
            h-9 sm:h-10 w-full border-none shadow-none 
            px-0 sm:px-1 text-sm 
            focus-visible:ring-0 focus-visible:ring-offset-0
          "
          autoComplete="off"
          inputMode="search"
        />
      </div>

      {/* ADVANCED FILTERS */}
      <div className="flex-shrink-0">
        <AdvancedFilters value={adv} onApply={(next) => setAdv({ ...next })} />
      </div>
    </div>
  );
}
