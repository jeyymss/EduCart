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
  | "Sale"
  | "Rent"
  | "Trade"
  | "Emergency Lending"
  | "PasaBuy"
  | "Donation and Giveaway";

export type AdvancedFilterValue = {
  time: "newest" | "oldest" | null;
  price: "low" | "high" | null;
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
  const [side, setSide] = React.useState<"left" | "right">("right");
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const MENU_WIDTH = 288; // w-72
  const SIDE_OFFSET = 8;

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
  }, [value]);

  // Decide left vs right WHEN opening (never top/bottom)
  const handleOpenChange = (next: boolean) => {
    if (next && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right - SIDE_OFFSET;
      const spaceLeft = rect.left - SIDE_OFFSET;

      const canRight = spaceRight >= MENU_WIDTH;
      const canLeft = spaceLeft >= MENU_WIDTH;

      if (canRight) setSide("right");
      else if (canLeft) setSide("left");
      else {
        // pick the larger side and let collision handling nudge it,
        // but never flip to top/bottom.
        setSide(spaceRight >= spaceLeft ? "right" : "left");
      }
    }
    setOpen(next);
  };

  const apply = () => {
    onApply({ ...draft, posts: [...draft.posts] });
    setOpen(false);
  };

  const reset = () => {
    const cleared = { ...DEFAULT_VALUE, posts: [] };
    onApply(cleared);
    setDraft(cleared);
    // keep it OPEN after reset
    setOpen(true);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="icon"
          className="flex items-center justify-center w-9 h-9"
          aria-label="Advanced filters"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      {/* Force horizontal placement only */}
      <DropdownMenuContent
        // only left/right
        side={side}
        align="start"
        sideOffset={SIDE_OFFSET}
        collisionPadding={12}
        avoidCollisions={true} // nudge along the chosen side, never flip vertical
        className="
          w-72 p-0 flex flex-col overflow-hidden
          max-h-[calc(100dvh-96px)]
          overscroll-contain
        "
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2">
          <div className="text-sm font-semibold">Sort by</div>
        </div>

        {/* Scrollable body */}
        <div className="px-3 pb-2 space-y-3 overflow-y-auto">
          {/* Time */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Time
            </div>
            <DropdownMenuRadioGroup
              value={draft.time ?? ""}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  time: (v || null) as "newest" | "oldest" | null,
                }))
              }
            >
              {[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
              ].map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(e) => e.preventDefault()}
                  className={
                    draft.time === opt.value ? "text-[#E59E2C] font-medium" : ""
                  }
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </div>

          {/* Price */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Price
            </div>
            <DropdownMenuRadioGroup
              value={draft.price ?? ""}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  price: (v || null) as "low" | "high" | null,
                }))
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
                  className={
                    draft.price === opt.value ? "text-[#E59E2C] font-medium" : ""
                  }
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </div>

          {/* Post (multi-select) */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Post
            </div>
            {(
              [
                "Sale",
                "Rent",
                "Trade",
                "Emergency Lending",
                "PasaBuy",
                "Donation and Giveaway",
              ] as PostOpt[]
            ).map((opt) => {
              const checked = draft.posts.includes(opt);
              return (
                <DropdownMenuCheckboxItem
                  key={opt}
                  checked={checked}
                  onCheckedChange={() =>
                    setDraft((d) => ({
                      ...d,
                      posts: toggleArrayItem(d.posts, opt),
                    }))
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
        </div>

        {/* Sticky footer */}
        <div className="mt-auto sticky bottom-0 z-10 border-t px-3 py-3 bg-popover">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={apply}
              className="flex-1 h-9 text-sm bg-[#E59E2C] text-white hover:bg-[#d4881f]"
            >
              Apply
            </Button>
            <Button
              type="button"
              onClick={reset}
              variant="outline"
              className="flex-1 h-9 text-sm border border-gray-300"
            >
              Reset
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
