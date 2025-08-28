"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  body: string;
  created_at: string;
};

export default function ChatClient({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: number;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const supabaseBrowserClient = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pendingText, setPendingText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    const subscriptionChannel = supabaseBrowserClient
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

    // ✅ cleanup must return void, not a Promise
    return () => {
      // either of these is fine; both return a Promise which we intentionally ignore
      supabaseBrowserClient.removeChannel(subscriptionChannel);
      // or: subscriptionChannel.unsubscribe();
    };
  }, [conversationId, supabaseBrowserClient]);

  async function sendMessage() {
    const trimmedBody = pendingText.trim();
    if (!trimmedBody) return;
    setPendingText("");

    const { error } = await supabaseBrowserClient.from("messages").insert({
      conversation_id: conversationId,
      sender_user_id: currentUserId,
      body: trimmedBody,
    });

    if (error) {
      setPendingText(trimmedBody);
      alert(error.message);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50"
      >
        {messages.map((messageRow) => {
          const isFromCurrentUser = messageRow.sender_user_id === currentUserId;
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
                <div className="text-[10px] opacity-60 mt-1">
                  {new Date(messageRow.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t p-3 flex gap-2">
        <Input
          value={pendingText}
          onChange={(e) => setPendingText(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
