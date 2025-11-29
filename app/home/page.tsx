"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

import { ItemCard } from "@/components/posts/displayposts/ItemCard";
import { EmergencyCard } from "@/components/posts/displayposts/emergencyCard";
import { PasabuyCard } from "@/components/posts/displayposts/pasabuyCard";
import { GiveawayPostCard } from "@/components/posts/displayposts/giveawayPostCard";
import { ItemCardSkeleton } from "@/components/posts/displayposts/ItemCard";
import { PostCardSkeleton } from "@/components/EmergencyPasaBuySkele";
import { Button } from "@/components/ui/button";

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

import { Input } from "@/components/ui/input";

import {
  AdvancedFilters,
  type AdvancedFilterValue,
  type PostOpt,
} from "@/components/profile/AdvancedFilters";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EmergencyModal from "@/components/posts/itemDetails/EmergencyModal";
import PasabuyModal from "@/components/posts/itemDetails/PasabuyModal";

// Mobile ribbon
const MobileTopNav = dynamic(() => import("@/components/mobile/MobileTopNav"), {
  ssr: false,
});

const cv = {
  contentVisibility: "auto" as const,
  containIntrinsicSize: "800px",
};

/* Post type */
type ToolbarPost = "All" | PostOpt;

const POST_TYPE_OPTIONS: ToolbarPost[] = [
  "All",
  "Sale",
  "Rent",
  "Trade",
  "Emergency Lending",
  "PasaBuy",
  "Donation and Giveaway",
];

function SectionHeader({
  title,
  href = "#",
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#102E4A]">
          {title}
        </h2>
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

  // advanced filters
  const [postType, setPostType] = useState<ToolbarPost | null>(null);

  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

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

  const [selectedPasaBuy, setSelectedPasaBuy] =
    useState<PasaBuyPost | null>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    const term = q.trim();
    const params = new URLSearchParams();

    if (term) params.set("search", term);
    if (postType && postType !== "All") params.set("type", postType);
    if (adv.category) params.set("category", adv.category);
    if (adv.time) params.set("time", adv.time);
    if (adv.price) params.set("priceSort", adv.price);
    if (adv.posts && adv.posts.length > 0)
      params.set("posts", adv.posts.join(","));
    if (adv.minPrice != null) params.set("minPrice", String(adv.minPrice));
    if (adv.maxPrice != null) params.set("maxPrice", String(adv.maxPrice));

    const qs = params.toString();
    if (!qs) return;

    router.push(`/browse?${qs}`);
  }

  if (itemError && emergencyError) {
    return (
      <div className="px-4 md:px-8 py-10">
        Error: {(emergencyError as Error).message}
      </div>
    );
  }

  return (
    <div className="bg-white scroll-smooth">
      {/* MOBILE PRIMARY NAV RIBBON */}
      <MobileTopNav />

      {/* TOP SEARCH BAR */}
      <div id="home-top-search-origin">
        <div
          id="home-top-search"
          className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#102E4A]"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex justify-center"
              role="search"
              aria-label="Site search"
              suppressHydrationWarning
            >
              <div className="flex w-full max-w-4xl items-center gap-2 sm:gap-3 rounded-full bg-white shadow-md ring-1 ring-black/10 px-3 sm:px-4 py-1.5 sm:py-2">
                {/* Post Type dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E7F3FF] text-xs sm:text-sm font-medium text-[#102E4A] whitespace-nowrap hover:bg-[#d7e8ff]">
                    {postType ?? "All Types"}
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    {POST_TYPE_OPTIONS.map((label) => (
                      <DropdownMenuItem
                        key={label}
                        onClick={() =>
                          setPostType(label === "All" ? null : label)
                        }
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search input */}
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400 hidden sm:block" />

                  <Input
                    value={q ?? ""}
                    onChange={(e) => setQ(e.target.value)}
                    readOnly={!mounted}
                    placeholder="Search anything..."
                    className="h-9 sm:h-10 w-full border-none shadow-none px-0 sm:px-1 text-sm outline-none"
                    autoComplete="off"
                    inputMode="search"
                  />
                </div>

                {/* Advanced Filters */}
                <div className="flex-shrink-0">
                  <AdvancedFilters
                    value={adv}
                    onApply={(next) => setAdv({ ...next })}
                  />
                </div>

                <button type="submit" className="hidden" aria-hidden="true" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 pt-1 pb-20 md:pb-8 lg:pb-8 space-y-8 lg:space-y-10 max-w-[1600px] mx-auto">
        {/* CATEGORY GRID */}
        <section
          className="-mt-18 md:mt-4 lg:mt-6 rounded-2xl border bg-white p-4 sm:p-5 shadow-sm md:hover:shadow-md transition-all"
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
              {
                name: "Beauty & Personal Care",
                src: "/beauty.jpg",
                href: "#",
              },
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

        {/* MAIN CONTENT SECTIONS WRAPPER */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 bg-white -mt-4 md:-mt-6 lg:-mt-10">
          <div className="mx-auto max-w-[1600px] space-y-8 lg:space-y-10">
            {/* --- EMERGENCY LENDING --- */}
            <section
              id="emergency"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
              <SectionHeader
                title="Emergency Lending"
                href="/browse/emergency"
              />

              {emergencyLoading ? (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1 md:grid md:grid-cols-3 md:gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="min-w-[280px] md:min-w-0 snap-start">
                      <PostCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : emergency.length === 0 ? (
                <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                  No items available.
                </div>
              ) : (
                <>
                  {/* MOBILE: scroll, limit 3 */}
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1 md:hidden">
                    {emergency.slice(0, 3).map((emg) => (
                      <button
                        key={emg.post_id}
                        type="button"
                        onClick={() => setSelectedEmergency(emg)}
                        className="min-w-[280px] snap-start rounded-2xl bg-white text-left"
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

                  {/* DESKTOP */}
                  <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emergency.map((emg) => (
                      <button
                        key={emg.post_id}
                        type="button"
                        onClick={() => setSelectedEmergency(emg)}
                        className="rounded-2xl bg-white text-left"
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
                </>
              )}

              {/* EMERGENCY MODAL */}
              <EmergencyModal
                post={selectedEmergency}
                onClose={() => setSelectedEmergency(null)}
              />
            </section>

            {/* --- FEATURED LISTING --- */}
            <section
              id="featured"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
              <SectionHeader title="Featured Listing" href="/browse/featured" />

              {itemLoading ? (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
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

            {/* --- PASABUY --- */}
            <section
              id="pasabuy"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
              <SectionHeader title="PasaBuy Posts" href="/browse/pasabuy" />

              {pasabuyLoading ? (
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1 md:grid md:grid-cols-3 md:gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="min-w-[280px] md:min-w-0 snap-start">
                      <PostCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : pasabuy.length === 0 ? (
                <div className="flex h-28 items-center justify-center rounded-xl border bg-gray-50 text-gray-500">
                  No items available.
                </div>
              ) : (
                <>
                  {/* MOBILE */}
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 py-1 md:hidden">
                    {pasabuy.slice(0, 3).map((post) => (
                      <button
                        key={post.post_id}
                        type="button"
                        onClick={() => setSelectedPasaBuy(post)}
                        className="min-w-[280px] snap-start rounded-2xl bg-white text-left"
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

                  {/* DESKTOP */}
                  <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pasabuy.map((post) => (
                      <button
                        key={post.post_id}
                        type="button"
                        onClick={() => setSelectedPasaBuy(post)}
                        className="rounded-2xl bg-white text-left"
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
                </>
              )}

              {/* PASABUY MODAL */}
              <PasabuyModal
                post={selectedPasaBuy}
                onClose={() => setSelectedPasaBuy(null)}
              />
            </section>

            {/* --- DONATION & GIVEAWAYS --- */}
            <section
              id="giveaways"
              className="scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40"
              style={cv}
            >
              <SectionHeader
                title="Donation & Giveaways"
                href="/browse/giveaways"
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
                      className="transition-all duration-300 rounded-2xl bg-white"
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

      <Footer />
    </div>
  );
}
