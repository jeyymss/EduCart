"use client";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { useHomePageEmergency, useHomepageItems } from "@/hooks/displayItems";
import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import { ItemCardSkeleton } from "@/components/posts/displayposts/ItemCard";
import { EmergencyPostCardSkeleton } from "@/components/posts/displayposts/emergencyCard";
import { PasaBuyPostCardSkeleton } from "@/components/posts/displayposts/pasabuyCard";
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
import { useHomePagePasaBuy } from "@/hooks/displayItems";

type EmergencyPost = {
  post_id: string;
  full_name: string;
  role: string;
  university: string;
  item_title: string;
  item_description: string;
  post_type_name: string;
  created_at: string;
};

type PasaBuyPost = {
  post_id: string;
  full_name: string;
  role: string;
  serviceFee: number;
  university: string;
  item_title: string;
  item_description: string;
  post_type_name: string;
  created_at: string;
};

export default function HomePage() {
  //Fetch posts from sale, rent, trade
  const {
    data: items,
    isLoading: itemLoading,
    error: itemError,
  } = useHomepageItems();

  //Fetch posts from emergency lending
  const {
    data: emergency,
    isLoading: emergencyLoading,
    error: emergencyError,
  } = useHomePageEmergency();

  //Fetch posts from pasabuy
  const {
    data: pasabuy,
    isLoading: pasabuyLoading,
    error: pasabuyError,
  } = useHomePagePasaBuy();

  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyPost | null>(null);

  const [selectedPasaBuy, setSelectedPasaBuy] = useState<PasaBuyPost | null>(
    null
  );

  if (itemError && emergencyError)
    return <div>Error: {(itemError && (emergencyError as Error)).message}</div>;

  console.log(emergency?.map((e) => e.post_id));
  console.log(pasabuy?.map((p) => p.post_id));
  console.log(items?.map((i) => i.post_id));

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
        {/* EMERGENCY LENDING */}
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
            {emergency.map((emg) => (
              <div key={emg.post_id} onClick={() => setSelectedEmergency(emg)}>
                <EmergencyCard
                  id={emg.post_id}
                  title={emg.item_title}
                  description={emg.item_description}
                  isUrgent={emg.post_type_name === "Emergency Lending"}
                  created_at={emg.created_at}
                />
              </div>
            ))}
          </div>
        )}

        {/* Show All Details for Emergency Lending */}
        <Dialog
          open={!!selectedEmergency}
          onOpenChange={() => setSelectedEmergency(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEmergency?.item_title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-600 mt-2">
              <p>
                <strong>Description:</strong>{" "}
                {selectedEmergency?.item_description}
              </p>

              {emergencyLoading ? (
                <p>Loading...</p>
              ) : emergencyError ? (
                <p>Error fetching user: {(emergencyError as Error).message}</p>
              ) : (
                emergency && (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {selectedEmergency?.full_name}
                    </p>
                    <p>
                      <strong>University:</strong>{" "}
                      {selectedEmergency?.university}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedEmergency?.role}
                    </p>
                  </div>
                )
              )}

              <p>
                <strong>Posted:</strong>{" "}
                <span>
                  {getRelativeTime(selectedEmergency?.created_at ?? " ")}
                </span>
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
        {/* FEATURED LISTING */}
        {itemLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No items available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-5 mt-3">
            {items.map((item) => (
              <ItemCard
                key={item.post_id} // key on the top-level returned element
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
        {pasabuyLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <PasaBuyPostCardSkeleton key={i} />
            ))}
          </div>
        ) : !pasabuy || pasabuy.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No items available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-3">
            {pasabuy.map((post) => (
              <div key={post.post_id} onClick={() => setSelectedPasaBuy(post)}>
                <PasabuyCard
                  id={post.post_id}
                  title={post.item_title}
                  description={post.item_description}
                  serviceFee={post.serviceFee}
                  created_at={post.created_at}
                />
              </div>
            ))}
          </div>
        )}

        {/* Show All Details for PasaBuy */}
        <Dialog
          open={!!selectedPasaBuy}
          onOpenChange={() => setSelectedPasaBuy(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPasaBuy?.item_title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-600 mt-2">
              <p>
                <strong>Description:</strong>{" "}
                {selectedPasaBuy?.item_description}
              </p>

              {pasabuyLoading ? (
                <p>Loading...</p>
              ) : pasabuyError ? (
                <p>Error fetching user: {(pasabuyError as Error).message}</p>
              ) : (
                pasabuy && (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {selectedPasaBuy?.full_name}
                    </p>
                    <p>
                      <strong>University:</strong> {selectedPasaBuy?.university}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedPasaBuy?.role}
                    </p>
                  </div>
                )
              )}

              <p>
                <strong>Posted:</strong>{" "}
                <span>
                  {getRelativeTime(selectedPasaBuy?.created_at ?? " ")}
                </span>
              </p>
            </div>
            <DialogFooter>
              <Button className="hover:cursor-pointer">Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
