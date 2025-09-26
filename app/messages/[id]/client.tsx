"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  body: string | null;
  attachments: string[] | null;
  created_at: string;
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
  otherUserId: string | null;
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [conversationId, supabase]);

  async function sendMessage() {
    const trimmedBody = pendingText.trim();
    if (!trimmedBody && selectedFiles.length === 0) return;

    const uploadedUrls: string[] = [];

    // 1. Upload all selected files
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

    // 2. Insert text as its own message
    if (trimmedBody) {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: currentUserId,
        body: trimmedBody,
        attachments: null,
      });

      if (error) {
        alert(error.message);
      }
    }

    // 3. Insert each uploaded image as its own message
    for (const url of uploadedUrls) {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: currentUserId,
        body: null,
        attachments: [url], // one image per message
      });

      if (error) {
        alert(error.message);
      }
    }

    // 4. Reset input + file selection
    setPendingText("");
    setSelectedFiles([]);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = ""; // reset so same file can be picked again
  }

  return (
    <>
      <div className="flex flex-col h-full border rounded-2xl border-black">
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

          {/* Visit button */}
          <Link href={`/${otherUserId}`}>
            <button className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100 hover:cursor-pointer">
              Visit
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Item Preview */}
        {itemImage && (
          <div>
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
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{itemTitle}</p>
                <p className="text-xs text-slate-500">{postType}</p>
                {itemPrice && (
                  <p className="text-xs text-[#E59E2C]">
                    ₱{itemPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Messages - only this scrolls */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50"
        >
          {messages.map((messageRow) => {
            const isFromCurrentUser =
              messageRow.sender_user_id === currentUserId;

            // if multiple images
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
                    <div
                      className={`text-[10px] opacity-60 mt-1 ${
                        isFromCurrentUser ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {new Date(messageRow.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ));
            }

            // normal text message
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
                  <div
                    className={`text-[10px] opacity-60 mt-1 ${
                      isFromCurrentUser ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {new Date(messageRow.created_at).toLocaleString()}
                  </div>
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
                    className="absolute top-0 right-0 bg-black/70 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input stays pinned */}
        <div className="border-t p-3 flex gap-2 bg-white rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded hover:bg-gray-100"
          >
            📎
          </button>
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
