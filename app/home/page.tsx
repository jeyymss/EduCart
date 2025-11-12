"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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

import dynamic from "next/dynamic";
import MessageSellerButton from "@/components/messages/MessageSellerBtn";
import Footer from "@/components/Footer";
// Mobile ribbon
const MobileTopNav = dynamic(() => import("@/components/mobile/MobileTopNav"), {
  ssr: false,
});

const cv = { contentVisibility: "auto" as const, containIntrinsicSize: "800px" };
const hoverCard =
  "transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-lg rounded-2xl bg-white";

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
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#102E4A]">
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="inline-flex items-center rounded-full bg-[#102E4A]/5 border border-[#102E4A]/10 px-2.5 py-0.5 text-xs font-medium text-[#577C8E]">
            {count}
          </span>
        )}
      </div>
      <Link href={href} className="shrink-0">
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
  const router = useRouter();
  const [q, setQ] = useState<string>("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/browse?search=${encodeURIComponent(term)}`);
  }

  if (itemError && emergencyError) {
    return (
      <div className="px-4 md:px-8 py-10">
        Error: {(emergencyError as Error).message}
      </div>
    );
  }

  return (
    <div className="bg-white scroll-smooth pt-2 md:pt-0">
      {/* MOBILE PRIMARY NAV RIBBON */}
      <MobileTopNav />

      <div id="home-top-search-origin">
        <div id="home-top-search" className="w-full bg-[#102E4A]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8"> {/* CHANGED: py-5 -> py-3 */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex justify-center"
              role="search"
              aria-label="Site search"
              suppressHydrationWarning
            >
              <div className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl">
                <input
                  value={q ?? ""}
                  onChange={(e) => setQ(e.target.value)}
                  readOnly={!mounted}
                  placeholder="Search anything…"
                  className="w-full rounded-full bg-white pr-12 pl-4 md:pl-5 h-11 sm:h-12 text-[15px] outline-none shadow-md ring-1 ring-black/10 placeholder:text-gray-400"
                  autoComplete="off"
                  inputMode="search"
                />

                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F3FF] ring-1 ring-black/10 hover:bg-white transition"
                >
                  <Search className="h-4 w-4 text-[#102E4A]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 pt-1 pb-8 md:pt-8 space-y-10 max-w-[1600px] mx-auto">
        {/* CATEGORY GRID */}
        <section
          className="-mt-18 md:mt-0 rounded-2xl border bg-white p-4 sm:p-5 shadow-sm md:hover:shadow-md transition-all"
          style={cv}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#102E4A] text-base sm:text-lg">
              Browse by Category Listing
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4">
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
                className="group relative block overflow-hidden rounded-xl border bg-white shadow-sm md:hover:-translate-y-1 md:hover:shadow-md transition-all"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={cat.src}
                    alt={cat.name}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 18vw, 12vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />
                  <span className="absolute inset-x-0 bottom-0 m-2 rounded-lg bg-white/85 px-2.5 py-1 text-center text-[10px] sm:text-[11px] font-semibold text-[#102E4A] ring-1 ring-black/10 backdrop-blur md:group-hover:bg-white">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT SECTIONS */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-8 bg-white">
          <div className="mx-auto max-w-[1600px] space-y-12">
            {/* Emergency Lending */}
            <section
              id="emergency"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
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
                      className={`${hoverCard} text-left focus:outline-none`}
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
                      <MessageSellerButton      
                        postId={selectedEmergency.post_id}
                        sellerId={selectedEmergency.post_user_id}
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </section>

            {/* Featured Listing */}
            <section
              id="featured"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
              <SectionHeader
                title="Featured Listing"
                count={items?.length ?? 0}
                href="#"
              />
              {itemLoading ? (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1">
                  {Array.from({ length: 5 }).map((_, a) => (
                    <div
                      key={a}
                      className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] snap-start"
                    >
                      <ItemCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : !items || items.length === 0 ? (
                <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                  No items available.
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1">
                  {items.map((item) => (
                    <div
                      key={item.post_id}
                      className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] snap-start md:hover:shadow-lg rounded-2xl bg-white"
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

            {/* PasaBuy */}
            <section
              id="pasabuy"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
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
                      className={`${hoverCard} text-left focus:outline-none`}
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
                      <MessageSellerButton      
                        postId={selectedPasaBuy.post_id}
                        sellerId={selectedPasaBuy.post_user_id}
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </section>

            {/* Donation & Giveaways */}
            <section
              id="giveaways"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
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
                    <div key={post.id} className={hoverCard}>
                      <GiveawayPostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
