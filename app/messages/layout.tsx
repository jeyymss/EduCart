// app/messages/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import MessagesRealtimeRefresher from "@/components/messages/MessagesRealtimeRefresher";

type Row = {
  conversation_id: number;
  other_user_name: string | null;
  other_user_avatar_url: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  last_message_created_at: string | null;
};

export default async function MessagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("my_convo")
    .select(
      "conversation_id, other_user_name, other_user_avatar_url, last_message_body, last_message_at, last_message_created_at"
    )
    .order("last_message_at", { ascending: false });

  const conversations: Row[] = data ?? [];
  const convoIds = conversations.map((c) => c.conversation_id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-64px)]">
      {/* 👇 Realtime refresher */}
      <MessagesRealtimeRefresher
        currentUserId={user?.id ?? ""}
        conversationIds={convoIds}
      />

      <aside className="border-r bg-white overflow-y-auto">
        <div className="p-4 border-b font-semibold">Messages</div>

        {conversations.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No messages yet.</div>
        ) : (
          <ul className="divide-y">
            {conversations.map((row) => (
              <li key={row.conversation_id}>
                <Link
                  href={`/messages/${row.conversation_id}`}
                  className="flex gap-3 items-center p-3 hover:bg-slate-50"
                >
                  <Avatar url={row.other_user_avatar_url} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {row.other_user_name ?? "User"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {row.last_message_body ?? "No messages yet"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="min-h-0">{children}</main>
    </div>
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
