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
  EmergencyPost,
  PasaBuyPost,
} from "@/hooks/queries/displayItems";
import { useGiveawayPosts } from "@/hooks/queries/GiveawayPosts";

import {
  Home,
  ShoppingBag,
  Dumbbell,
  Monitor,
  BookOpen,
  Shirt,
  Sparkles,
  Watch,
  Gamepad2,
} from "lucide-react";

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
      {/* ===== Welcome Banner ===== */}
      <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#FEF7E5_0%,_#FFFDF6_100%)]" />
        <div className="pointer-events-none absolute -top-10 -left-10 h-56 w-56 rounded-full bg-[#E7F3FF] blur-3xl opacity-40" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-[#FFF1D0] blur-3xl opacity-50" />

        <div className="relative w-full">
          <div className="mx-auto max-w-[1600px] h-[230px] md:h-[250px] lg:h-[270px] px-4 md:px-8 flex items-center justify-between gap-6 md:gap-8">
            <div className="relative flex items-center -ml-10 md:-ml-16 lg:-ml-20">
              <Image
                src="/hand.png"
                alt="EduCart"
                width={420}
                height={420}
                className="h-auto w-[340px] sm:w-[360px] md:w-[400px] lg:w-[420px] object-contain drop-shadow-sm"
                priority
              />
              <div className="absolute left-[78%] sm:left-[80%] md:left-[82%] lg:left-[83%] top-1/2 -translate-y-1/2">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-[#102E4A] whitespace-nowrap">
                  Hello there!
                </h1>
                <p className="mt-2 text-base md:text-lg text-[#102E4A]/80 leading-tight">
                  let’s shop, share, and support each other!
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-end">
              <span className="text-sm text-[#102E4A]/70 mb-2">Quick links:</span>
              <div className="flex flex-wrap justify-center md:justify-end gap-2">
                {[
                  { label: "🚨 Emergency", href: "#emergency" },
                  { label: "⭐ Featured", href: "#featured" },
                  { label: "🤝 PasaBuy", href: "#pasabuy" },
                  { label: "🎁 Giveaways", href: "#giveaways" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="rounded-full bg-white border border-[#D0E4F2] px-4 py-1.5 text-sm font-medium text-[#102E4A] shadow-sm hover:bg-[#E7F3FF] hover:scale-105 transition-all"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Categories ===== */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#102E4A] text-lg">
            Browse by Category
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-4">
          {[
            { name: "Home & Furniture", icon: Home },
            { name: "Pet Supplies", icon: ShoppingBag },
            { name: "Sports", icon: Dumbbell },
            { name: "Electronics", icon: Monitor },
            { name: "Academic", icon: BookOpen },
            { name: "Clothing", icon: Shirt },
            { name: "Beauty & Personal Care", icon: Sparkles },
            { name: "Accessories", icon: Watch },
            { name: "Hobbies & Toys", icon: Gamepad2 },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href="#"
                className="flex flex-col items-center justify-center rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:bg-[#E7F3FF]/40"
              >
                <Icon className="h-7 w-7 text-[#102E4A] mb-2" />
                <span className="text-xs font-medium text-[#102E4A] text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-8 bg-white">
        <div className="mx-auto max-w-[1600px] space-y-10">
          {/* --- Emergency Lending --- */}
          <section
            id="emergency"
            className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
          >
            <SectionHeader title="Emergency Lending" count={emergency?.length ?? 0} href="#" />
            {emergencyLoading ? (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[360px] snap-start">
                    <PostCardSkeleton />
                  </div>
                ))}
              </div>
            ) : emergency.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                No items available.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
                {emergency.map((emg) => (
                  <button
                    key={emg.post_id}
                    type="button"
                    onClick={() => setSelectedEmergency(emg)}
                    className="min-w-[360px] snap-start text-left"
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
              <Dialog open onOpenChange={(open) => !open && setSelectedEmergency(null)}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedEmergency.item_title}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p><strong>Description:</strong> {selectedEmergency.item_description ?? ""}</p>
                    <p><strong>Name:</strong> {selectedEmergency.full_name ?? ""}</p>
                    <p><strong>University:</strong> {selectedEmergency.university_abbreviation ?? ""}</p>
                    <p><strong>Role:</strong> {selectedEmergency.role ?? ""}</p>
                    <p><strong>Posted:</strong> {getRelativeTime(selectedEmergency.created_at)}</p>
                  </div>
                  <DialogFooter>
                    <Button>Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>

          {/* --- Featured Listing --- */}
          <section
            id="featured"
            className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
          >
            <SectionHeader title="Featured Listing" count={items?.length ?? 0} href="#" />
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
                  <div key={item.post_id} className="min-w-[340px] md:min-w-[360px] snap-start">
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

          {/* --- PasaBuy Posts --- */}
          <section
            id="pasabuy"
            className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
          >
            <SectionHeader title="PasaBuy Posts" count={pasabuy?.length ?? 0} href="#" />
            {pasabuyLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <PostCardSkeleton />
                  </div>
                ))}
              </div>
            ) : pasabuy.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                No items available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {pasabuy.map((post) => (
                  <button
                    key={post.post_id}
                    type="button"
                    onClick={() => setSelectedPasaBuy(post)}
                    className="text-left"
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
              <Dialog open onOpenChange={(open) => !open && setSelectedPasaBuy(null)}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedPasaBuy.item_title}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p><strong>Description:</strong> {selectedPasaBuy.item_description ?? ""}</p>
                    <p><strong>Name:</strong> {selectedPasaBuy.full_name ?? ""}</p>
                    <p><strong>University:</strong> {selectedPasaBuy.university_abbreviation ?? ""}</p>
                    <p><strong>Role:</strong> {selectedPasaBuy.role ?? ""}</p>
                    <p><strong>Posted:</strong> {getRelativeTime(selectedPasaBuy.created_at)}</p>
                  </div>
                  <DialogFooter>
                    <Button>Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>

          {/* --- Donation & Giveaways --- */}
          <section
            id="giveaways"
            className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
          >
            <SectionHeader title="Donation & Giveaways" count={giveaways?.length ?? 0} href="#" />
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
                  <div key={post.id}>
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
