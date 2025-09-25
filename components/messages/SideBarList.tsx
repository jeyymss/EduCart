"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

type Row = {
  conversation_id: number;
  other_user_id: string | null;
  other_user_name: string | null;
  other_user_avatar_url: string | null;
  last_message_body: string | null;
  has_unread?: boolean; // ✅ from view
};

export default function SidebarList({
  conversations: initialConvos,
}: {
  conversations: Row[];
}) {
  const pathname = usePathname();
  const currentId = pathname.split("/").pop();
  const router = useRouter();
  const supabase = createClient();

  const [conversations, setConversations] = useState(initialConvos);

  if (conversations.length === 0) {
    return <div className="p-6 text-sm text-slate-500">No messages yet.</div>;
  }

  async function handleClick(conversationId: number) {
    // ✅ Optimistically update local state
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === conversationId ? { ...c, has_unread: false } : c
      )
    );

    // ✅ Update last_read_at in DB
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

  return (
    <ul className="divide-y">
      {conversations.map((row) => {
        const isActive = String(row.conversation_id) === currentId;

        return (
          <li key={row.conversation_id}>
            <button
              onClick={() => handleClick(row.conversation_id)}
              className={`flex gap-3 items-center w-full text-left p-3 hover:bg-slate-50 hover:cursor-pointer
                ${isActive ? "bg-slate-100" : ""}
                ${row.has_unread && !isActive ? "bg-blue-50" : ""}`}
            >
              <Avatar url={row.other_user_avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium truncate ${
                      row.has_unread ? "font-semibold text-slate-900" : ""
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
                <div
                  className={`text-xs truncate ${
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
