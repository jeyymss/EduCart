"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublicProfile, usePublicListings } from "@/hooks/queries/profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, MessageCircle, ChevronDown } from "lucide-react";
import {
  ItemCard,
  ItemCardSkeleton,
} from "@/components/posts/displayposts/ItemCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useTransition, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import type {
  AdvancedFilterValue,
  PostOpt,
} from "@/components/profile/AdvancedFilters";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getRelativeTime } from "@/utils/getRelativeTime";
import UserReviews from "@/components/profile/UserReviews";
import ReportUserDialog from "@/components/report/reportUserDialog";
import { submitUserReport } from "@/app/api/reports/reportUser/route";
import MobileTopNav from "@/components/mobile/MobileTopNav";

type PublicListing = {
  id: string;
  item_title: string | null;
  item_price: number | null;
  item_condition: string | null;
  category_name: string | null;
  post_type_name: string | null;
  created_at: string;
  image_urls: string[] | null;
  status: "Listed" | "Sold" | "Unlisted";
  item_description?: string | null;
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

function byPrice(a: PublicListing, b: PublicListing, dir: "low" | "high") {
  const aHas = a.item_price != null;
  const bHas = b.item_price != null;
  if (!aHas && !bHas) return 0;
  if (!aHas) return dir === "low" ? 1 : -1;
  if (!bHas) return dir === "low" ? -1 : 1;
  return dir === "low"
    ? (a.item_price as number) - (b.item_price as number)
    : (b.item_price as number) - (a.item_price as number);
}

function byTime(a: PublicListing, b: PublicListing, dir: "newest" | "oldest") {
  const at = new Date(a.created_at).getTime();
  const bt = new Date(b.created_at).getTime();
  return dir === "newest" ? bt - at : at - bt;
}

export default function PublicProfilePage() {
  const { userId } = useParams() as { userId: string };
  const router = useRouter();
  const supabase = createClient();
  const [pending, start] = useTransition();
  const [showReport, setShowReport] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [otherText, setOtherText] = useState("");

  const { data: profile, isLoading, error } = usePublicProfile(userId);
  const {
    data: listings = { data: [] as PublicListing[] },
    isLoading: listingsLoading,
  } = usePublicListings(userId, 1, 12);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [postType, setPostType] = useState<string | null>(null);
  const [adv, setAdv] = useState<AdvancedFilterValue>({
    time: null,
    price: null,
    posts: [],
    category: undefined,
    minPrice: null,
    maxPrice: null,
  });

  const [selectedSpecial, setSelectedSpecial] = useState<PublicListing | null>(
    null
  );

  const allowedPostTypes = useMemo<string[] | null>(() => {
    if (adv.posts && adv.posts.length > 0) {
      return (adv.posts as PostOpt[]).flatMap(expandToAllSpellings);
    }
    return postType ? [postType] : null;
  }, [adv.posts, postType]);

  const filteredListings = useMemo(() => {
    return (listings.data ?? [])
      .filter((item: PublicListing) => {
        const matchesSearch = (item.item_title ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPostType = allowedPostTypes
          ? allowedPostTypes.includes(item.post_type_name ?? "")
          : true;

        let matchesAdv = true;
        if (adv.category && item.category_name !== adv.category)
          matchesAdv = false;
        if (
          adv.minPrice != null &&
          Number(item.item_price ?? 0) < Number(adv.minPrice)
        )
          matchesAdv = false;
        if (
          adv.maxPrice != null &&
          Number(item.item_price ?? 0) > Number(adv.maxPrice)
        )
          matchesAdv = false;

        return matchesSearch && matchesPostType && matchesAdv;
      })
      .sort((a: PublicListing, b: PublicListing) => {
        if (adv.price) return byPrice(a, b, adv.price);
        if (adv.time) return byTime(a, b, adv.time);
        return 0;
      });
  }, [listings.data, searchTerm, allowedPostTypes, adv]);

  if (isLoading) return <div className="p-6 text-center">Loading…</div>;

  if (error || !profile)
    return <div className="p-6 text-red-600">Profile not found.</div>;

  const initials = profile.full_name
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = profile.avatar_url
    ? `${profile.avatar_url}${
        profile.avatar_url.includes("?") ? "&" : "?"
      }v=${profile.user_id ?? "1"}`
    : undefined;

  const startChat = () => {
    if (!listings.data.length) {
      alert("This user has no listings.");
      return;
    }
    const firstPostId = listings.data[0].id;

    start(async () => {
      const { data, error } = await supabase.rpc("start_chat_for_post", {
        input_post_id: firstPostId,
      });

      if (error) return alert(error.message);

      router.push(`/messages/${data?.conversation_id}`);
    });
  };

  const reportSubmit = async () => {
    if (!selectedReportReason) return alert("Select a reason.");

    const finalDescription =
      selectedReportReason === "OtherReport" ? otherText : null;

    const { error } = await submitUserReport({
      reportedUserId: userId,
      reportType: selectedReportReason,
      description: finalDescription,
    });

    if (error) return alert("Failed to submit report.");

    alert("Report submitted.");
    setShowReport(false);
    setSelectedReportReason("");
    setOtherText("");
  };

  return (
    <>
      <MobileTopNav showOnlyBottom />
      <div className="pb-8">
      {/* COVER PHOTO */}
      <div className="relative w-full h-60 md:h-80 lg:h-96 overflow-hidden">
        {profile.background_url && (
          <Image
            src={profile.background_url}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button className="absolute top-6 right-6 p-2 bg-white/80 hover:bg-gray-100 rounded-full shadow">
              <MoreHorizontal className="h-6 w-6 text-gray-700" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="mr-6 p-2 w-36">
            <button
              onClick={() => setShowReport(true)}
              className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded-md"
            >
              Report
            </button>
          </PopoverContent>
        </Popover>

        <ReportUserDialog
          open={showReport}
          onOpenChange={setShowReport}
          selectedReportReason={selectedReportReason}
          setSelectedReportReason={setSelectedReportReason}
          otherText={otherText}
          setOtherText={setOtherText}
          onSubmit={reportSubmit}
        />
      </div>

      {/* ============================
          ⭐ UPDATED MOBILE PROFILE HEADER
      ============================ */}
      <div className="bg-white shadow-sm px-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="relative -mt-16 rounded-full ring-4 ring-white shadow-md overflow-hidden"
            style={{ width: 128, height: 128 }}
          >
            <Avatar className="h-full w-full">
              <AvatarImage
                key={profile.avatar_url ?? "no-avatar"}
                src={avatarSrc ?? ""}
                alt={profile.full_name}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* TEXT + BUTTON */}
          <div className="flex-1 mt-2">
            {/* FULL NAME (⭐ smaller on mobile + allow 2 lines) */}
            <h1 className="font-bold leading-tight text-xl md:text-2xl line-clamp-2">
              {profile.full_name}
            </h1>

            {/* BIO */}
            <p className="text-gray-500 text-sm md:text-base">
              {profile.bio ?? "This user has no bio yet."}
            </p>

            {/* TAGS (side by side) */}
            <div className="flex flex-row gap-2 mt-2 flex-wrap">
              {profile.role && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {profile.role}
                </span>
              )}

              {profile.university_abbreviation && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {profile.university_abbreviation}
                </span>
              )}
            </div>

            {/* ⭐ MOVE MESSAGE BELOW TAGS & RIGHT */}
            <div className="flex justify-end mt-3 md:hidden">
              <Button
                onClick={startChat}
                disabled={pending}
                className="flex items-center gap-2 bg-[#F3D58D] hover:bg-[#F3D58D]/90 text-black font-medium px-4 py-2 rounded-lg shadow-sm"
              >
                <MessageCircle className="h-5 w-5" />
                {pending ? "Starting…" : "Message"}
              </Button>
            </div>
          </div>

          {/* DESKTOP MESSAGE BUTTON (unchanged) */}
          <Button
            onClick={startChat}
            disabled={pending}
            className="hidden md:flex self-start mt-2 items-center gap-2 bg-[#F3D58D] hover:bg-[#F3D58D]/90 text-black font-medium px-4 py-2 rounded-lg shadow-sm"
          >
            <MessageCircle className="h-5 w-5" />
            {pending ? "Starting…" : "Message"}
          </Button>
        </div>
      </div>

      {/* ============================
          ⭐ MOBILE SECTION
      ============================ */}
      <div className="md:hidden w-full px-4 mt-6 space-y-6">
        {/* Mobile Reviews */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-3">Reviews</h2>
          <UserReviews userId={userId} />
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">
            Listings ({filteredListings.length})
          </h2>

          {/* ⭐ MOBILE FILTER BAR — Improved */}
          <div className="space-y-3">
            {/* Post Type */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-2.5 border rounded-xl bg-white shadow-sm text-sm font-medium">
                {postType ?? "Post Type"}
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPostType(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPostType("Sale")}>
                  Sale
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPostType("Rent")}>
                  Rent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPostType("Trade")}>
                  Trade
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPostType("Emergency Lending")}
                >
                  Emergency Lending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPostType("PasaBuy")}>
                  PasaBuy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPostType("Giveaway")}>
                  Giveaway
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ⭐ Search + Filters side-by-side */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search items"
                className="h-10 text-sm rounded-xl flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Filters */}
              <AdvancedFilters
                value={adv}
                onApply={(next) =>
                  setAdv({ ...next, posts: [...(next.posts ?? [])] })
                }
              />
            </div>
          </div>

          {/* Listings Grid */}
          <div className="mt-5">
            {listingsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border shadow-sm"
                  >
                    <ItemCardSkeleton />
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No listings found.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredListings.map((item: PublicListing) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden bg-white border shadow-sm"
                  >
                    <ItemCard
                      id={item.id}
                      condition={item.item_condition ?? ""}
                      title={item.item_title ?? ""}
                      category_name={item.category_name ?? ""}
                      image_urls={item.image_urls ?? []}
                      price={item.item_price ?? undefined}
                      post_type={item.post_type_name ?? ""}
                      seller={profile.full_name ?? "Unknown"}
                      status={item.status}
                      created_at={item.created_at}
                      onOpenSpecialModal={() => setSelectedSpecial(item)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT — UNTOUCHED */}
      <div className="hidden md:block px-10 mt-10">
        <div className="grid grid-cols-[3fr_1fr] gap-8">
          {/* Desktop Listings */}
          <section>
            <div className="border rounded-2xl bg-white p-8 shadow-sm w-full">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <h2 className="text-xl font-semibold">
                  Listings ({filteredListings.length})
                </h2>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium">
                      Post Type <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPostType(null)}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Sale")}>
                        Sale
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Rent")}>
                        Rent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("Trade")}>
                        Trade
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setPostType("Emergency Lending")}
                      >
                        Emergency Lending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostType("PasaBuy")}>
                        PasaBuy
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setPostType("Giveaway")}
                      >
                        Giveaway
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Input
                    type="text"
                    placeholder="Search items"
                    className="h-9 w-[200px] text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <AdvancedFilters
                    value={adv}
                    onApply={(next) =>
                      setAdv({ ...next, posts: [...(next.posts ?? [])] })
                    }
                  />
                </div>
              </div>

              {/* Desktop Grid */}
              {listingsLoading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white">
                      <ItemCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <p className="text-gray-500 py-4">
                  No listings match your filters.
                </p>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredListings.map((item: PublicListing) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white hover:shadow-lg transition-all duration-300"
                    >
                      <ItemCard
                        id={item.id}
                        condition={item.item_condition ?? ""}
                        title={item.item_title ?? ""}
                        category_name={item.category_name ?? ""}
                        image_urls={item.image_urls ?? []}
                        price={item.item_price ?? undefined}
                        post_type={item.post_type_name ?? ""}
                        seller={profile.full_name ?? "Unknown"}
                        status={item.status}
                        created_at={item.created_at}
                        onOpenSpecialModal={() => setSelectedSpecial(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Desktop Reviews */}
          <aside>
            <div className="sticky top-20">
              <div className="border rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Reviews</h2>
                <UserReviews userId={userId} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* SPECIAL MODAL */}
      {selectedSpecial &&
        (selectedSpecial.post_type_name === "Emergency Lending" ||
          selectedSpecial.post_type_name === "PasaBuy") && (
          <Dialog open onOpenChange={(o) => !o && setSelectedSpecial(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedSpecial.item_title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2 text-sm text-gray-600 mt-2">
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedSpecial.item_description ?? "No description."}
                </p>
                <p>
                  <strong>Name:</strong> {profile.full_name}
                </p>
                <p>
                  <strong>University:</strong>{" "}
                  {profile.university_abbreviation}
                </p>
                <p>
                  <strong>Role:</strong> {profile.role}
                </p>
                <p>
                  <strong>Posted:</strong>{" "}
                  {getRelativeTime(selectedSpecial.created_at)}
                </p>
              </div>

              <DialogFooter>
                <Button onClick={startChat}>Message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
    </div>
  </>
  );
}
