import Link from "next/link";
import Image from "next/image";
import { Clock, MoreHorizontal, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelativeTime } from "@/utils/getRelativeTime";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/user-posts/deletePost/actions";
import {
  markAsListed,
  markAsUnlisted,
} from "@/app/user-posts/editPostStatus/actions";
import PostTypeBadge from "@/components/postTypeBadge";
import EditPostDialog from "../edit/EditPostDialog";
import { useState } from "react";

type Props = {
  id: string;
  title: string;
  price?: number;
  seller: string;
  condition: string;
  category_name: string;
  post_type: string;
  created_at: string;
  image_urls: string[];
  status: "Listed" | "Sold" | "Unlisted";
  isOwner?: boolean;
  isFav?: boolean;
  description?: string;
  item_trade?: string;
  item_service_fee?: number | null;
  quantity?: number | null;

  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;

  onToggleFavorite?: (id: string, isFav: boolean) => void;

  onOpenSpecialModal?: (id: string, postType: string) => void;
};

export function ItemCard({
  id,
  title,
  price,
  category_name,
  post_type,
  created_at,
  image_urls,
  status,
  isOwner = false,
  isFav = false,
  description,
  item_trade,
  item_service_fee,
  quantity,
  onToggleFavorite,
  onEdit,
  onOpenSpecialModal,
}: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);




  const firstValid = image_urls?.find((u) => u && u.trim() !== "");
  const imageSrc =
    firstValid ??
    (post_type === "Emergency Lending" || post_type === "PasaBuy"
      ? "/bluecart.png"
      : "/fallback.png");

  async function handleDelete(id: string) {
    const confirmed = confirm("🗑️ Are you sure you want to delete this post?");
    if (!confirmed) return;
    try {
      await deletePost(id);
      window.location.reload();
    } catch {
      alert("❌ Failed to delete post");
    }
  }

  async function handleMarkUnlisted(id: string) {
    try {
      await markAsUnlisted(id);
      window.location.reload();
    } catch {
      alert("❌ Failed to mark as unlisted");
    }
  }

  async function handleMarkListed(id: string) {
    try {
      await markAsListed(id);
      window.location.reload();
    } catch {
      alert("❌ Failed to mark as listed");
    }
  }

  const isSpecial =
    post_type === "Emergency Lending" || post_type === "PasaBuy";

  function handleCardClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (isSpecial && onOpenSpecialModal) {
      e.preventDefault();
      onOpenSpecialModal(id, post_type);
    }
  }

  return (
    <div className="relative rounded-md overflow-hidden border border-gray-200 shadow hover:shadow-md transition bg-white flex flex-col h-full">
      {/* Owner menu */}
      {isOwner && (
        <div className="absolute top-2 right-2 z-10 hover:cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/70 transition">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setEditingPost({
                    post_id: id,
                    item_price: price ?? null,
                    item_description: description ?? "",
                    item_trade: item_trade ?? "",
                    item_service_fee: item_service_fee ?? null,
                    quantity: quantity ?? null,
                    post_type_name: post_type,
                  });
                  setOpenEdit(true);
                }}
              >
                ✏️ Edit Post
              </DropdownMenuItem>




              {status === "Listed" && (
                <DropdownMenuItem onClick={() => handleMarkUnlisted(id)}>
                  🚫 Mark as Unlisted
                </DropdownMenuItem>
              )}

              {status === "Unlisted" && (
                <DropdownMenuItem onClick={() => handleMarkListed(id)}>
                  ✅ Mark as Listed
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(id)}
              >
                🗑️ Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Favorite heart */}
      {!isOwner && isFav && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(id, isFav);
            }}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            <Heart className="h-5 w-5 fill-red-500" />
          </Button>
        </div>
      )}

      <Link
        href={`/product/${id}`}
        className="flex flex-col h-full"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative w-full h-60">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <PostTypeBadge
            type={post_type as any}
            className="absolute top-2 left-2 shadow"
          />
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div className="space-y-0.5">

            {/* Title */}
            <h2
              className="
                font-semibold text-[#333333] line-clamp-2
                text-base
                sm:text-lg
              "
            >
              {title}
            </h2>

            {/* Category */}
            <span
              className="
                text-[10px] sm:text-xs
                border border-[#B8B8B8]
                px-2 py-0.5 rounded-full text-[#333333]
                inline-block
              "
            >
              {category_name}
            </span>

          </div>

          {/* Price + Time */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[#E59E2C] font-medium text-sm">
              {price != null ? `₱${price.toLocaleString()}` : "Price not listed"}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {getRelativeTime(created_at)}
            </div>
          </div>
        </div>
      </Link>

      {editingPost && (
          <EditPostDialog
            open={openEdit}
            onOpenChange={setOpenEdit}
            post={editingPost}
            onSave={async (updated) => {
              await fetch(`/api/posts/update/${editingPost.post_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              });

              window.location.reload();
            }}
          />
        )}


    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-md overflow-hidden border border-gray-200 shadow bg-white flex flex-col h-full animate-pulse">
      <div className="relative w-full h-60">
        <Skeleton className="absolute inset-0 bg-gray-300" />
        <Skeleton className="absolute top-2 left-2 h-5 w-16 bg-gray-400 rounded-full" />
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-3/4 bg-gray-400 rounded" />
            <Skeleton className="h-5 w-14 bg-gray-400 rounded-full" />
          </div>
          <Skeleton className="h-4 w-2/3 bg-gray-300 rounded" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-20 bg-gray-300 rounded" />
          <Skeleton className="h-4 w-16 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
