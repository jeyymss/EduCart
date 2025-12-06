"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []); // stable instance
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a stable reference for dependencies
  const convIds = useMemo(() => conversationIds, [conversationIds]);

  // Debounced refresh to avoid too many refreshes
  const debouncedRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      router.refresh();
    }, 2000); // Wait 2 seconds before refreshing to avoid disrupting active chats
  };

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
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    // 2) New messages (in any conversation) -> refresh ONLY sidebar, NEVER the active chat
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

          // Extract current conversation ID from pathname
          const match = pathname?.match(/\/messages\/(\d+)/);
          const currentConvoId = match ? parseInt(match[1]) : null;

          // NEVER refresh if we're in an active conversation
          // The client component handles real-time updates via polling
          if (currentConvoId) {
            return; // Don't refresh at all if viewing any conversation
          }

          // Only refresh if this message is in my conversations and we're on the messages list
          if (convIds.length === 0 || convIds.includes(convoId)) {
            debouncedRefresh();
          }
        }
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(convPartChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserId, convIds, router, supabase, pathname]);

  return null;
}