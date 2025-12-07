"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useMemo } from "react";

type Row = {
  conversation_id: number;
  other_user_id: string | null;
  other_user_name: string | null;
  other_user_avatar_url: string | null;
  last_message_body: string | null;
  last_message_created_at?: string | null;
  has_unread?: boolean;
};

export default function SidebarList({
  conversations: initialConvos,
}: {
  conversations: Row[];
}) {
  const pathname = usePathname();
  const currentId = pathname.split("/").pop();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [conversations, setConversations] = useState(initialConvos);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id ?? null);
    }
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for new messages
  useEffect(() => {
    const channel = supabase
      .channel("conversation-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: any) => {
          const newMessage = payload.new as {
            conversation_id: number;
            body: string | null;
            sender_user_id: string;
            created_at: string;
          };

          setConversations((prev) => {
            const existing = prev.find(
              (c) => c.conversation_id === newMessage.conversation_id
            );

            if (existing) {
              const updated: Row = {
                ...existing,
                last_message_body: newMessage.body,
                last_message_created_at: newMessage.created_at,
                has_unread:
                  newMessage.sender_user_id !== currentUserId
                    ? true
                    : existing.has_unread,
              };

              const others = prev.filter(
                (c) => c.conversation_id !== newMessage.conversation_id
              );

              // Put the updated conversation at the top (most recent)
              return [updated, ...others];
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  if (conversations.length === 0) {
    return <div className="p-6 text-sm text-slate-500">No messages yet.</div>;
  }

  async function handleClick(conversationId: number) {
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === conversationId ? { ...c, has_unread: false } : c
      )
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("participant_user_id", user.id);
    }

    router.push(`/messages/${conversationId}`);
  }

  // Sort conversations by most recent first
  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = a.last_message_created_at ? new Date(a.last_message_created_at).getTime() : 0;
    const dateB = b.last_message_created_at ? new Date(b.last_message_created_at).getTime() : 0;
    return dateB - dateA; // Most recent first
  });

  return (
    <ul className="divide-y divide-slate-200">
      {sortedConversations.map((row) => {
        const isActive = String(row.conversation_id) === currentId;

        return (
          <li key={row.conversation_id}>
            <button
              onClick={() => handleClick(row.conversation_id)}
              className={`flex gap-3 items-center w-full text-left p-4 transition-all duration-200
                ${isActive ? "bg-blue-100 border-l-4 border-blue-500 shadow-sm" : "hover:bg-slate-100"}
                ${row.has_unread && !isActive ? "bg-blue-50 border-l-4 border-blue-300" : ""}`}
            >
              <Avatar url={row.other_user_avatar_url} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  {/* MOBILE */}
                  <span
                    className={`text-sm max-md:text-base font-medium truncate ${
                      row.has_unread
                        ? "font-semibold text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    {row.other_user_name ?? "User"}
                  </span>

                  {row.has_unread && !isActive && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>

                {/* MOBILE */}
                <div
                  className={`text-xs max-md:text-sm truncate ${
                    row.has_unread
                      ? "text-slate-800 font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {row.last_message_body ?? "No messages yet"}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar({ url }: { url: string | null }) {
  if (!url) return <div className="h-10 w-10 rounded-full bg-slate-200" />;
  return (
    <Image
      src={url}
      alt="avatar"
      width={40}
      height={40}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
}
