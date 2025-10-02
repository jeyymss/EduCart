"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Camera, FilePenLine, X } from "lucide-react";
import PostTypeBadge from "@/components/postTypeBadge";
import SaleTransacForm from "@/components/transaction/forms/SaleTransac";

type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_user_id: string | null;
  body: string | null;
  attachments: string[] | null;
  created_at: string;
  type?: "user" | "system";
  transaction_id?: string | null;
  transactions?: {
    id: string;
    item_title: string | null;
    price: number | null;
    fulfillment_method: string | null;
    payment_method: string | null;
    meetup_location: string | null;
    meetup_date: string | null;
    meetup_time: string | null;
    status: string | null;
  } | null;
};

export default function ChatClient({
  conversationId,
  currentUserId,
  initialMessages,
  otherUserName,
  otherUserAvatarUrl,
  otherUserId,
  postId,
  itemImage,
  itemTitle,
  postType,
  itemPrice,
}: {
  conversationId: number;
  currentUserId: string;
  initialMessages: ChatMessage[];
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  otherUserId: string;
  postId: string;
  itemImage: string | null;
  itemTitle: string | null;
  postType: string | null;
  itemPrice: number | null;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pendingText, setPendingText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  // Realtime subscription
  useEffect(() => {
    const subscriptionChannel = supabase
      .channel(`conversation_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // fetch with transaction join
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              transactions (
                id,
                item_title,
                price,
                fulfillment_method,
                payment_method,
                meetup_location,
                meetup_date,
                meetup_time,
                status
              )
            `
            )
            .eq("id", (payload.new as any).id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as ChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [conversationId, supabase]);

  // Send normal user message
  async function sendMessage() {
    const trimmedBody = pendingText.trim();
    if (!trimmedBody && selectedFiles.length === 0) return;

    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop();
      const filePath = `${conversationId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-uploads")
        .upload(filePath, file);

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("chat-uploads")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    if (trimmedBody) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: currentUserId,
        body: trimmedBody,
        attachments: null,
        type: "user",
      });
    }

    for (const url of uploadedUrls) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: currentUserId,
        body: null,
        attachments: [url],
        type: "user",
      });
    }

    setPendingText("");
    setSelectedFiles([]);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b rounded-t-2xl bg-white shrink-0">
          <div className="flex items-center gap-3">
            {otherUserAvatarUrl ? (
              <Image
                src={otherUserAvatarUrl}
                alt="avatar"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-200" />
            )}
            <div className="font-medium">{otherUserName}</div>
          </div>
          <Link href={`/${otherUserId}`}>
            <button className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100 hover:cursor-pointer">
              Visit
            </button>
          </Link>
        </div>

        {/* Item Preview */}
        {itemImage && (
          <Link
            href={`/product/${postId}`}
            className="flex items-center gap-3 p-4 border-b bg-white shrink-0"
          >
            <Image
              src={itemImage}
              alt={itemTitle ?? "Item"}
              width={56}
              height={56}
              className="h-20 w-20 rounded-md object-fill"
            />
            <div className="space-y-2">
              <PostTypeBadge
                type={postType as any}
                className="text-xs text-slate-500"
              />
              <p className="text-sm font-medium truncate">{itemTitle}</p>
              {itemPrice && (
                <p className="text-xs text-[#E59E2C]">
                  ₱{itemPrice.toLocaleString()}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50"
        >
          {messages.map((messageRow) => {
            // ✅ 1. Check if system message first
            if (messageRow.type === "system" && messageRow.transactions) {
              const txn = messageRow.transactions;
              return (
                <div key={messageRow.id} className="flex justify-center w-full">
                  <div className="bg-slate-100 border rounded-lg p-4 text-sm max-w-md">
                    <p className="font-semibold mb-2">
                      Transaction Form Completed
                    </p>
                    <p>
                      <strong>Transaction type:</strong> Buy
                    </p>
                    <p>
                      <strong>Price (₱):</strong> {txn.price?.toLocaleString()}
                    </p>
                    <p>
                      <strong>Preferred method:</strong>{" "}
                      {txn.fulfillment_method}
                    </p>
                    {txn.meetup_location && (
                      <p>
                        <strong>Location:</strong> {txn.meetup_location}
                      </p>
                    )}
                    {txn.meetup_date && (
                      <p>
                        <strong>Date:</strong> {txn.meetup_date}
                      </p>
                    )}
                    {txn.meetup_time && (
                      <p>
                        <strong>Time:</strong> {txn.meetup_time}
                      </p>
                    )}
                    <p>
                      <strong>Payment method:</strong> {txn.payment_method}
                    </p>
                    <p>
                      <strong>Status:</strong> {txn.status}
                    </p>
                  </div>
                </div>
              );
            }

            // ✅ 2. Normal attachment or user message
            const isFromCurrentUser =
              messageRow.sender_user_id === currentUserId;

            if (messageRow.attachments && messageRow.attachments.length > 0) {
              // Attachments
              if (messageRow.attachments && messageRow.attachments.length > 0) {
                return messageRow.attachments.map((url, idx) => (
                  <div
                    key={`${messageRow.id}-${idx}`}
                    className={`flex ${
                      isFromCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-2 ${
                        isFromCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      <Image
                        src={url}
                        alt="uploaded"
                        width={250}
                        height={250}
                        className="rounded-lg object-cover w-full h-auto cursor-pointer"
                        onClick={() => setPreviewUrl(url)}
                      />
                    </div>
                  </div>
                ));
              }
            }

            // Normal user text message
            return (
              <div
                key={messageRow.id}
                className={`flex ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isFromCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {messageRow.body}
                </div>
              </div>
            );
          })}
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex gap-2 p-2 border-t bg-white">
            {selectedFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={idx} className="relative">
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={60}
                    height={60}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-0 right-0 bg-black/70 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3 flex gap-2 bg-white rounded-b-2xl shrink-0">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded hover:bg-gray-100 hover:cursor-pointer"
                >
                  <Camera />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Attachment</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <Dialog>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="px-2 py-2 rounded hover:bg-gray-100 hover:cursor-pointer"
                    >
                      <FilePenLine />
                    </button>
                  </DialogTrigger>
                </TooltipTrigger>
                <DialogContent
                  onInteractOutside={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => e.preventDefault()}
                >
                  <DialogClose asChild>
                    <button
                      className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </DialogClose>

                  <DialogHeader>
                    <div className="flex items-center">
                      <DialogTitle>Form</DialogTitle>
                      <PostTypeBadge type={postType as any} />
                    </div>
                    <DialogDescription>Fill up form</DialogDescription>
                  </DialogHeader>

                  {postType === "Sale" && (
                    <SaleTransacForm
                      conversationId={conversationId}
                      itemPrice={itemPrice}
                      itemTitle={itemTitle}
                      sellerId={otherUserId}
                      post_id={postId}
                      postType={postType || ""}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <TooltipContent>
                <p>Fill Up Form</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <Input
            value={pendingText}
            onChange={(e) => setPendingText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogTitle className="text-white text-sm px-4 py-2" />
        <DialogContent className="border-none bg-transparent p-0 flex items-center justify-center">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="preview"
              width={1600}
              height={1200}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
