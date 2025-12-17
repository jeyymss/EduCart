"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

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

import SmartSearchBar from "@/components/search/SearchBar";

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

/* MOBILE RIBBON */
const MobileTopNav = dynamic(() => import("@/components/mobile/MobileTopNav"), {
  ssr: false,
});

/* Post type type */
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

const cv = {
  contentVisibility: "auto" as const,
  containIntrinsicSize: "800px",
};

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [postType, setPostType] = useState<ToolbarPost | null>(null);

  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  const {
    data: items = [],
    isLoading: itemLoading,
    error: itemError,
  } = useHomepageItems();

  const {
    data: emergency = [],
    isLoading: emergencyLoading,
  } = useHomePageEmergency();

  const {
    data: pasabuy = [],
    isLoading: pasabuyLoading,
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

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (postType && postType !== "All") params.set("type", postType);
    if (adv.category) params.set("category", adv.category);
    if (adv.time) params.set("time", adv.time);
    if (adv.price) params.set("priceSort", adv.price);
    if (adv.posts.length > 0) params.set("posts", adv.posts.join(","));
    if (adv.minPrice != null) params.set("minPrice", String(adv.minPrice));
    if (adv.maxPrice != null) params.set("maxPrice", String(adv.maxPrice));

    const qs = params.toString();
    if (!qs) return;

    router.push(`/browse?${qs}`);
  }

  if (itemError) {
    return (
      <div className="px-4 md:px-8 py-10">
        Error: {(itemError as Error).message}
      </div>
    );
  }

  return (
    <div className="bg-white scroll-smooth">
      {/* MOBILE NAV */}
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
            >
              <SmartSearchBar
                search={search}
                setSearch={setSearch}
                postType={postType}
                setPostType={setPostType}
                adv={adv}
                setAdv={setAdv}
              />
            </form>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 md:pt-2 -mt-20 sm:-mt-4 md:-mt-2 pb-20 md:pb-8 lg:pb-8 space-y-8 lg:space-y-10 max-w-[1600px] mx-auto">
        {/* EMERGENCY + REST OF SECTIONS */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 bg-white">
          <div className="mx-auto max-w-[1600px] space-y-8 lg:space-y-10">
            {/* EMERGENCY SECTION */}
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
                  {/* MOBILE */}
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

              <EmergencyModal
                post={selectedEmergency}
                onClose={() => setSelectedEmergency(null)}
              />
            </section>

            {/* FEATURED */}
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
              ) : !items.length ? (
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

            {/* PASABUY */}
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
                          created_at={post.created_at} items={[]}                        />
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
                          created_at={post.created_at} items={[]}                        />
                      </button>
                    ))}
                  </div>
                </>
              )}

              <PasabuyModal
                post={selectedPasaBuy}
                onClose={() => setSelectedPasaBuy(null)}
              />
            </section>

            {/* GIVEAWAYS */}
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
