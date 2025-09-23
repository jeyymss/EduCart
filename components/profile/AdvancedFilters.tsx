"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export type PostOpt =
  | "Sell"
  | "Rent"
  | "Trade"
  | "Emergency Lending"
  | "Pasabuy"
  | "Donation and Giveaway";

export type AdvancedFilterValue = {
  /** single-select */
  time: "newest" | "oldest" | null;
  price: "low" | "high" | null;

  /** multi-select */
  posts: PostOpt[];

  category?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
};

const DEFAULT_VALUE: AdvancedFilterValue = {
  time: null,
  price: null,
  posts: [],
};

function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

type Props = {
  value?: Partial<AdvancedFilterValue>;
  onApply: (filters: AdvancedFilterValue) => void;
};

export function AdvancedFilters({ value, onApply }: Props) {
  const [open, setOpen] = React.useState(false);

  const [draft, setDraft] = React.useState<AdvancedFilterValue>({
    ...DEFAULT_VALUE,
    ...value,
    posts: value?.posts ?? [],
  });

  React.useEffect(() => {
    setDraft({
      ...DEFAULT_VALUE,
      ...value,
      posts: value?.posts ?? [],
    });
  }, [value?.time, value?.price, JSON.stringify(value?.posts)]);

  const apply = () => {
    onApply({
      ...draft,
      posts: [...draft.posts]
    });
    setOpen(false);
  };

  const reset = () => {
    onApply({ ...DEFAULT_VALUE, posts: [] });
    setDraft({ ...DEFAULT_VALUE, posts: [] });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center w-9 h-9"
          aria-label="Advanced filters"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-3 space-y-3" align="end">
        <div className="text-sm font-semibold">Sort by</div>

        {/* Time (single select) */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Time</div>
          <DropdownMenuRadioGroup
            value={draft.time ?? ""}
            onValueChange={(v) =>
              setDraft((d) => ({ ...d, time: (v || null) as "newest" | "oldest" | null }))
            }
          >
            {[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
            ].map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                onSelect={(e) => e.preventDefault()} // keep open
                className={draft.time === opt.value ? "text-[#E59E2C] font-medium" : ""}
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>

        {/* Price (single select) */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Price</div>
          <DropdownMenuRadioGroup
            value={draft.price ?? ""}
            onValueChange={(v) =>
              setDraft((d) => ({ ...d, price: (v || null) as "low" | "high" | null }))
            }
          >
            {[
              { value: "low", label: "Low to High" },
              { value: "high", label: "High to Low" },
            ].map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                onSelect={(e) => e.preventDefault()}
                className={draft.price === opt.value ? "text-[#E59E2C] font-medium" : ""}
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>

        {/* Post (multi-select) */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Post</div>
          {(
            [
              "Sell",
              "Rent",
              "Trade",
              "Emergency Lending",
              "Pasabuy",
              "Donation and Giveaway",
            ] as PostOpt[]
          ).map((opt) => {
            const checked = draft.posts.includes(opt);
            return (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={checked}
                onCheckedChange={() =>
                  setDraft((d) => ({ ...d, posts: toggleArrayItem(d.posts, opt) }))
                }
                onSelect={(e) => e.preventDefault()}
                className={checked ? "text-[#E59E2C] font-medium" : ""}
              >
                {opt}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={apply}
            className="flex-1 bg-[#E59E2C] text-white hover:bg-[#d4881f]"
          >
            Apply
          </Button>
          <Button
            type="button"
            onClick={reset}
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
