"use client";

import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { useUserPosts } from "@/hooks/queries/displayItems";
import type {
  AdvancedFilterValue,
  PostOpt,
} from "@/components/profile/AdvancedFilters";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { useState } from "react";

export type UserPost = {
  post_id: string;
  item_title: string;
  item_price: number | null;
  item_condition: string | null;
  category_name: string | null;
  post_type_name: string | null;
  created_at: string; // ISO
  image_urls: string[];
  full_name: string;
  status: "Listed" | "Sold" | "Unlisted";

  // optional, used by the modal if present
  item_description?: string | null;
  university_abbreviation?: string | null;
  role?: string | null;
};

type UserPostsProps = {
  userId: string;
  status?: "Listed" | "Sold" | "Unlisted";
  postType?: string | null;
  search?: string;
  filters?: Partial<AdvancedFilterValue>;
};

const POST_VALUE_MAP: Record<PostOpt, string> = {
  Sale: "Sale",
  Rent: "Rent",
  Trade: "Trade",
  "Emergency Lending": "Emergency Lending",
  PasaBuy: "PasaBuy",
  "Donation and Giveaway": "Giveaway",
};

const expandToAllSpellings = (p: PostOpt) => {
  const backend = POST_VALUE_MAP[p] ?? p;
  return backend === p ? [p] : [p, backend];
};

function byPrice(a: UserPost, b: UserPost, dir: "low" | "high") {
  const aHas = a.item_price != null;
  const bHas = b.item_price != null;
  if (!aHas && !bHas) return 0;
  if (!aHas) return dir === "low" ? 1 : -1;
  if (!bHas) return dir === "low" ? -1 : 1;
  return dir === "low"
    ? (a.item_price as number) - (b.item_price as number)
    : (b.item_price as number) - (a.item_price as number);
}

function byTime(a: UserPost, b: UserPost, dir: "newest" | "oldest") {
  const at = new Date(a.created_at).getTime();
  const bt = new Date(b.created_at).getTime();
  return dir === "newest" ? bt - at : at - bt;
}

export function UserPosts({
  userId,
  status,
  postType,
  search,
  filters = {},
}: UserPostsProps) {
  const { data: posts, isLoading, error } = useUserPosts(userId, status);

  // Modal state (Emergency Lending / PasaBuy)
  const [selectedSpecial, setSelectedSpecial] = useState<UserPost | null>(null);

  if (error)
    return <p className="text-red-600">Error: {(error as Error).message}</p>;

  if (isLoading) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-full">
            <ItemCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        {status
          ? `No ${status.toLowerCase()} posts yet.`
          : "You haven’t posted anything yet."}
      </p>
    );
  }

  // ——— Filtering ———
  const allowedPostTypes: string[] | null =
    filters.posts && filters.posts.length > 0
      ? (filters.posts as PostOpt[]).flatMap(expandToAllSpellings)
      : postType
      ? [postType]
      : null;

  const filtered = posts.filter((item: UserPost) => {
    const matchesPostType = allowedPostTypes
      ? allowedPostTypes.includes(item.post_type_name ?? "")
      : true;

    const matchesSearch = search
      ? item.item_title.toLowerCase().includes(search.toLowerCase())
      : true;

    let matchesAdv = true;

    if (filters.category && item.category_name !== filters.category) {
      matchesAdv = false;
    }
    if (
      filters.minPrice != null &&
      Number(item.item_price ?? 0) < Number(filters.minPrice)
    ) {
      matchesAdv = false;
    }
    if (
      filters.maxPrice != null &&
      Number(item.item_price ?? 0) > Number(filters.maxPrice)
    ) {
      matchesAdv = false;
    }

    return matchesPostType && matchesSearch && matchesAdv;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No posts match your filters.
      </p>
    );
  }

  // ——— Sorting (no hooks here to avoid rules-of-hooks issues) ———
  const sorted = [...filtered].sort((a, b) => {
    if (filters.price) return byPrice(a, b, filters.price);
    if (filters.time) return byTime(a, b, filters.time);
    return 0;
  });

  return (
    <>
      <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3">
        {sorted.map((item: UserPost) => (
          <div key={item.post_id} className="h-full">
            <ItemCard
              id={item.post_id}
              title={item.item_title}
              price={item.item_price ?? undefined}
              condition={item.item_condition ?? ""}
              category_name={item.category_name ?? ""}
              post_type={item.post_type_name ?? ""}
              created_at={item.created_at}
              image_urls={item.image_urls ?? []}
              seller={item.full_name}
              isOwner={true}
              status={item.status}
              onEdit={(id) => console.log("Edit", id)}
              onDelete={(id) => console.log("Delete", id)}
              onOpenSpecialModal={() => {
                setSelectedSpecial(item);
              }}
            />
          </div>
        ))}
      </div>

      {selectedSpecial &&
        (selectedSpecial.post_type_name === "Emergency Lending" ||
          selectedSpecial.post_type_name === "PasaBuy") && (
          <Dialog
            open
            onOpenChange={(open) => {
              if (!open) setSelectedSpecial(null);
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedSpecial.item_title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2 text-sm text-gray-600 mt-2">
                <div className="space-y-2">
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedSpecial.item_description ?? ""}
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedSpecial.full_name ?? ""}
                  </p>
                  <p>
                    <strong>University:</strong>{" "}
                    {selectedSpecial.university_abbreviation ?? ""}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedSpecial.role ?? ""}
                  </p>
                  <p>
                    <strong>Posted:</strong>{" "}
                    <span>{getRelativeTime(selectedSpecial.created_at)}</span>
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button className="hover:cursor-pointer">Message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
    </>
  );
}

UserPosts.Count = function UserPostsCount({
  userId,
  status,
  postType,
  search,
  filters = {},
}: {
  userId: string;
  status?: "Listed" | "Sold" | "Unlisted";
  postType?: string | null;
  search?: string;
  filters?: Partial<AdvancedFilterValue>;
}) {
  const { data: posts, isLoading } = useUserPosts(userId, status);
  if (isLoading) return <>…</>;
  if (!posts) return <>0</>;

  const allowedPostTypes: string[] | null =
    filters?.posts && filters.posts.length > 0
      ? (filters.posts as PostOpt[]).flatMap(expandToAllSpellings)
      : postType
      ? [postType]
      : null;

  const filtered = posts.filter((item: UserPost) => {
    const matchesPostType = allowedPostTypes
      ? allowedPostTypes.includes(item.post_type_name ?? "")
      : true;

    const matchesSearch = search
      ? item.item_title.toLowerCase().includes(search.toLowerCase())
      : true;

    let matchesAdv = true;

    if (filters?.category && item.category_name !== filters.category) {
      matchesAdv = false;
    }
    if (
      filters?.minPrice != null &&
      Number(item.item_price ?? 0) < Number(filters.minPrice)
    ) {
      matchesAdv = false;
    }
    if (
      filters?.maxPrice != null &&
      Number(item.item_price ?? 0) > Number(filters.maxPrice)
    ) {
      matchesAdv = false;
    }

    return matchesPostType && matchesSearch && matchesAdv;
  });

  return <>{filtered.length}</>;
};
