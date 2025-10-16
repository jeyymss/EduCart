"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import { PasabuyCard } from "@/components/posts/displayposts/pasabuyCard";
import { GiveawayPostCard } from "@/components/posts/displayposts/giveawayPostCard";
import { ItemCardSkeleton } from "@/components/posts/displayposts/ItemCard";
import { PostCardSkeleton } from "@/components/EmergencyPasaBuySkele";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRelativeTime } from "@/utils/getRelativeTime";

import {
  useHomePageEmergency,
  useHomepageItems,
  useHomePagePasaBuy,
  type EmergencyPost,
  type PasaBuyPost,
} from "@/hooks/queries/displayItems";
import { useGiveawayPosts } from "@/hooks/queries/GiveawayPosts";

function SectionHeader({
  title,
  count,
  href = "#",
}: {
  title: string;
  count?: number;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#102E4A]">
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="inline-flex items-center rounded-full bg-[#102E4A]/5 border border-[#102E4A]/10 px-2.5 py-0.5 text-xs font-medium text-[#577C8E]">
            {count}
          </span>
        )}
      </div>
      <Link href={href}>
        <Button
          variant="ghost"
          className="h-8 px-3 text-[#577C8E] hover:bg-[#577C8E]/10"
        >
          View All
        </Button>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const {
    data: items = [],
    isLoading: itemLoading,
    error: itemError,
  } = useHomepageItems();
  const {
    data: emergency = [],
    isLoading: emergencyLoading,
    error: emergencyError,
  } = useHomePageEmergency();
  const {
    data: pasabuy = [],
    isLoading: pasabuyLoading,
    error: pasabuyError,
  } = useHomePagePasaBuy();
  const {
    data: giveaways = [],
    isLoading: giveawaysLoading,
    error: giveawaysError,
  } = useGiveawayPosts();

  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyPost | null>(null);
  const [selectedPasaBuy, setSelectedPasaBuy] = useState<PasaBuyPost | null>(
    null
  );

  if (itemError && emergencyError) {
    return (
      <div className="px-4 md:px-8 py-10">
        Error: {(itemError && (emergencyError as Error)).message}
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8 space-y-10 bg-white scroll-smooth">
      {/* CATEGORY GRID */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#102E4A] text-lg">
            Browse by Category Listing
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-4">
          {[
            { name: "Hobbies & Toys", src: "/hobbies.jpg", href: "#" },
            { name: "Accessories", src: "/accessories.jpg", href: "#" },
            { name: "Beauty & Personal Care", src: "/beauty.jpg", href: "#" },
            { name: "Clothing", src: "/clothing.jpg", href: "#" },
            { name: "Academic", src: "/academic.jpg", href: "#" },
            { name: "Electronics", src: "/electronics.jpg", href: "#" },
            { name: "Sports", src: "/sports.jpg", href: "#" },
            { name: "Pet Supplies", src: "/pet.jpg", href: "#" },
            { name: "Home & Furniture", src: "/home.jpg", href: "#" },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative block overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={cat.src}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 12vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />
                <span className="absolute inset-x-0 bottom-0 m-2 rounded-lg bg-white/85 px-2.5 py-1 text-center text-[11px] font-semibold text-[#102E4A] ring-1 ring-black/10 backdrop-blur group-hover:bg-white">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT SECTIONS */}
      <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-8 bg-white">
        <div className="mx-auto max-w-[1600px] space-y-10">
          {/* Emergency Lending Section */}
          <section id="emergency" className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40">
            <SectionHeader
              title="Emergency Lending"
              count={emergency?.length ?? 0}
              href="#"
            />
            {emergencyLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : emergency.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                No items available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergency.map((emg) => (
                  <button
                    key={emg.post_id}
                    type="button"
                    onClick={() => setSelectedEmergency(emg)}
                    className="text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-white focus:outline-none"
                  >
                    <EmergencyCard
                      id={emg.post_id}
                      title={emg.item_title}
                      description={emg.item_description}
                      isUrgent={emg.post_type_name === "Emergency Lending"}
                      created_at={emg.created_at}
                    />
                  </button>
                ))}
              </div>
            )}

            {selectedEmergency && (
              <Dialog
                open
                onOpenChange={(open) => !open && setSelectedEmergency(null)}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedEmergency.item_title}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedEmergency.item_description ?? ""}
                    </p>
                    <p>
                      <strong>Name:</strong> {selectedEmergency.full_name ?? ""}
                    </p>
                    <p>
                      <strong>University:</strong>{" "}
                      {selectedEmergency.university_abbreviation ?? ""}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedEmergency.role ?? ""}
                    </p>
                    <p>
                      <strong>Posted:</strong>{" "}
                      {getRelativeTime(selectedEmergency.created_at)}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button>Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>

          {/* Featured Listing Section */}
          <section id="featured" className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40">
            <SectionHeader
              title="Featured Listing"
              count={items?.length ?? 0}
              href="#"
            />
            {itemLoading ? (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
                {Array.from({ length: 5 }).map((_, a) => (
                  <div key={a} className="min-w-[340px] md:min-w-[360px] snap-start">
                    <ItemCardSkeleton />
                  </div>
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                No items available.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
                {items.map((item) => (
                  <div
                    key={item.post_id}
                    className="min-w-[340px] md:min-w-[360px] snap-start transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-white"
                  >
                    <ItemCard
                      id={item.post_id}
                      condition={item.item_condition}
                      title={item.item_title}
                      category_name={item.category_name}
                      image_urls={item.image_urls}
                      price={item.item_price}
                      post_type={item.post_type_name}
                      seller={item.full_name || "Unknown"}
                      created_at={item.created_at}
                      status={item.status}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PasaBuy Section */}
          <section id="pasabuy" className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40">
            <SectionHeader
              title="PasaBuy Posts"
              count={pasabuy?.length ?? 0}
              href="#"
            />
            {pasabuyLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : pasabuy.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                No items available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pasabuy.map((post) => (
                  <button
                    key={post.post_id}
                    type="button"
                    onClick={() => setSelectedPasaBuy(post)}
                    className="text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-white focus:outline-none"
                  >
                    <PasabuyCard
                      id={post.post_id}
                      title={post.item_title}
                      description={post.item_description}
                      serviceFee={post.item_service_fee}
                      created_at={post.created_at}
                    />
                  </button>
                ))}
              </div>
            )}

            {selectedPasaBuy && (
              <Dialog
                open
                onOpenChange={(open) => !open && setSelectedPasaBuy(null)}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedPasaBuy.item_title}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedPasaBuy.item_description ?? ""}
                    </p>
                    <p>
                      <strong>Name:</strong> {selectedPasaBuy.full_name ?? ""}
                    </p>
                    <p>
                      <strong>University:</strong>{" "}
                      {selectedPasaBuy.university_abbreviation ?? ""}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedPasaBuy.role ?? ""}
                    </p>
                    <p>
                      <strong>Posted:</strong>{" "}
                      {getRelativeTime(selectedPasaBuy.created_at)}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button>Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>

          {/* Donation & Giveaways Section */}
          <section id="giveaways" className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40">
            <SectionHeader
              title="Donation & Giveaways"
              count={giveaways?.length ?? 0}
              href="#"
            />
            <div className="space-y-4">
              {giveawaysLoading && <p>Loading…</p>}
              {giveawaysError && (
                <p className="text-red-500">Failed to load giveaways</p>
              )}
              {giveaways.length === 0 && !giveawaysLoading ? (
                <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                  No donations yet.
                </div>
              ) : (
                giveaways.map((post) => (
                  <div
                    key={post.id}
                    className="transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-white"
                  >
                    <GiveawayPostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
