"use client";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useHomePageEmergency, useHomepageItems } from "@/hooks/displayItems";
import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import { ItemCardSkeleton } from "@/components/posts/displayposts/ItemCard";
import { EmergencyPostCardSkeleton } from "@/components/posts/displayposts/emergencyCard";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRelativeTime } from "@/utils/getRelativeTime";
import { PasabuyCard } from "@/components/posts/displayposts/pasabuyCard";

import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";

type EmergencyPost = {
  post_id: string;
  full_name: string;
  item_title: string;
  item_description: string;
  post_type_name: string;
  created_at: string;
};

export default function HomePage() {
  const {
    data: items,
    isLoading: itemLoading,
    error: itemError,
  } = useHomepageItems();
  const {
    data: emergency,
    isLoading: emergencyLoading,
    error: emergencyError,
  } = useHomePageEmergency();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  }: {
    data: UserProfile | undefined;
    isLoading: boolean;
    error: unknown;
  } = useUserProfile();

  const [selectedPost, setSelectedPost] = useState<EmergencyPost | null>(null);

  if (itemError && emergencyError)
    return <div>Error: {(itemError && (emergencyError as Error)).message}</div>;

  return (
    <div className="p-10 space-y-10">
      {/* DISPLAY EMERGENCY LENDING */}
      <div>
        <div className="flex justify-between">
          <h1 className="font-semibold text-[#102E4A]">Emergency Lending</h1>
          <Link href={"#"}>
            <span className="text-sm text-[#577C8E]">View All</span>
          </Link>
        </div>
        {emergencyLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <EmergencyPostCardSkeleton key={i} />
            ))}
          </div>
        ) : !emergency || emergency.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No items available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {emergency?.map((post) => (
              <div key={post.post_id} onClick={() => setSelectedPost(post)}>
                <EmergencyCard
                  id={post.post_id}
                  title={post.item_title}
                  description={post.item_description}
                  isUrgent={post.post_type_name === "Emergency Lending"}
                  created_at={post.created_at}
                />
              </div>
            ))}
          </div>
        )}

        {/* Show All Details for Emergency Lending */}
        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPost?.item_title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-600 mt-2">
              <p>
                <strong>Description:</strong> {selectedPost?.item_description}
              </p>

              {userLoading ? (
                <p>Loading...</p>
              ) : userError ? (
                <p>Error fetching user: {(userError as Error).message}</p>
              ) : (
                user && (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {user.full_name}
                    </p>
                    <p>
                      <strong>University:</strong>{" "}
                      {user.universities?.abbreviation ?? "N/A"}
                    </p>
                    <p>
                      <strong>Role:</strong> {user.role}
                    </p>
                  </div>
                )
              )}

              <p>
                <strong>Posted:</strong>{" "}
                <span>{getRelativeTime(selectedPost?.created_at ?? " ")}</span>
              </p>
            </div>
            <DialogFooter>
              <Button className="hover:cursor-pointer">Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* DISPLAY LISTED ITEMS */}
      <div>
        <div className="flex justify-between">
          <h1 className="font-semibold text-[#102E4A]">Featured Listing</h1>
          <Link href={"#"}>
            <span className="text-sm text-[#577C8E]">View All</span>
          </Link>
        </div>
        {itemLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No items available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
            {items.map((item) => (
              <ItemCard
                key={item.post_id}
                id={item.post_id}
                condition={item.item_condition}
                title={item.item_title}
                category_name={item.category_name}
                image_urls={item.image_urls}
                price={item.item_price}
                post_type={item.post_type_name}
                seller={item.full_name || "Unknown"}
                created_at={item.created_at}
              />
            ))}
          </div>
        )}
      </div>

      {/* DISPLAY PASABUY POSTS */}
      <div>
        <div className="flex justify-between">
          <h1 className="font-semibold text-[#102E4A]">PasaBuy Posts</h1>
          <Link href={"#"}>
            <span className="text-sm text-[#577C8E]">View All</span>
          </Link>
        </div>
        {emergencyLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <EmergencyPostCardSkeleton key={i} />
            ))}
          </div>
        ) : !emergency || emergency.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No items available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {emergency?.map((post) => (
              <div key={post.post_id} onClick={() => setSelectedPost(post)}>
                <PasabuyCard
                  id={post.post_id}
                  title={post.item_title}
                  description={post.item_description}
                  serviceFee={post.post_type_name === "Emergency Lending"}
                  created_at={post.created_at}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
