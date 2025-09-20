"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

type AdvancedFiltersProps = {
  onApply: (filters: string[]) => void;
};

export function AdvancedFilters({ onApply }: AdvancedFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const applyFilters = () => {
    onApply(selectedFilters);
  };

  const resetFilters = () => {
    setSelectedFilters([]);
    onApply([]); // send empty filters
  };

  const filterOptions = {
    Time: ["Newest First", "Oldest First"],
    Price: ["Low to High", "High to Low"],
    Post: [
      "Sell",
      "Rent",
      "Trade",
      "Emergency Lending",
      "Pasabuy",
      "Donation and Giveaway",
    ],
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center w-9 h-9"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-3 space-y-3">
        <div className="text-sm font-semibold">Sort by</div>

        {/* Time */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Time</div>
          {filterOptions.Time.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={selectedFilters.includes(opt)}
              onCheckedChange={() => toggleFilter(opt)}
              onSelect={(e) => e.preventDefault()} // prevent auto-close
              className={
                selectedFilters.includes(opt) ? "text-[#E59E2C] font-medium" : ""
              }
            >
              {opt}
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        {/* Price */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Price</div>
          {filterOptions.Price.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={selectedFilters.includes(opt)}
              onCheckedChange={() => toggleFilter(opt)}
              onSelect={(e) => e.preventDefault()}
              className={
                selectedFilters.includes(opt) ? "text-[#E59E2C] font-medium" : ""
              }
            >
              {opt}
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        {/* Post */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Post</div>
          {filterOptions.Post.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={selectedFilters.includes(opt)}
              onCheckedChange={() => toggleFilter(opt)}
              onSelect={(e) => e.preventDefault()}
              className={
                selectedFilters.includes(opt) ? "text-[#E59E2C] font-medium" : ""
              }
            >
              {opt}
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={applyFilters}
            className="flex-1 bg-[#E59E2C] text-white hover:bg-[#d4881f]"
          >
            Apply
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="flex-1 border border-gray-300"
          >
            Reset
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
