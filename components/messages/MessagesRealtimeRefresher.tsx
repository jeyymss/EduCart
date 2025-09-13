"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  currentUserId: string;
  conversationIds: number[]; // pass initial convo ids for lightweight filtering
};

export default function MessagesRealtimeRefresher({
  currentUserId,
  conversationIds,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []); // stable instance

  // Create a stable reference for dependencies
  const convIds = useMemo(() => conversationIds, [conversationIds]);

  useEffect(() => {
    if (!currentUserId) return;

    // 1) New conversation added for me
    const convPartChannel = supabase
      .channel(`convparts_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
          filter: `participant_user_id=eq.${currentUserId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    // 2) New messages (in any conversation) -> refresh if it's one of mine
    const messagesChannel = supabase
      .channel(`messages_side_refresh`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const convoId = (payload.new as { conversation_id: number })
            .conversation_id;
          if (convIds.length === 0 || convIds.includes(convoId)) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convPartChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserId, convIds, router, supabase]);

  return null;
}