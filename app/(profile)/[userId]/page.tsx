"use client";

import { useParams } from "next/navigation";
import { usePublicProfile, usePublicListings } from "@/hooks/profiles";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PublicProfilePage() {
  const { userId } = useParams() as { userId: string };
  const { data: profile, isLoading, error } = usePublicProfile(userId);
  const { data: listings } = usePublicListings(userId, 1, 12);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error || !profile)
    return <div className="p-6 text-red-600">Profile not found.</div>;

  const initials = profile.full_name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // cache-bust so a newly uploaded avatar shows immediately
  const avatarSrc = profile.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes("?") ? "&" : "?"}v=${
        profile.user_id ?? "1"
      }`
    : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border rounded-2xl p-4">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="h-14 w-14">
            <AvatarImage
              key={profile.avatar_url ?? "no-avatar"}
              src={avatarSrc}
              alt={profile.full_name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.full_name}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {profile.university_abbreviation ??
                profile.university_name ??
                "—"}{" "}
              • {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Listings</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.data?.map((p) => (
            <article
              key={p.id}
              className="border rounded-2xl p-3 flex flex-col"
            >
              <div className="text-xs font-medium mb-2 px-2 py-1 rounded bg-gray-100 w-fit">
                {p.post_type_name}
              </div>

              {p.image_urls?.[0] && (
                <div className="relative aspect-video w-full mb-3">
                  <Image
                    src={p.image_urls[0]}
                    alt={p.item_title}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              )}

              <h3 className="font-semibold line-clamp-2">{p.item_title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {p.item_description}
              </p>

              <div className="mt-auto pt-3 text-sm">
                {p.item_price != null
                  ? `₱${p.item_price.toLocaleString()}`
                  : "—"}
              </div>

              <Link
                href={`/product/${p.id}`}
                className="mt-2 text-sm underline"
              >
                View item
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
