import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import MessagesRealtimeRefresher from "@/components/messages/MessagesRealtimeRefresher";
import SidebarList from "@/components/messages/SideBarList";
import Image from "next/image";
import Footer from "@/components/Footer";

type Row = {
  conversation_id: number;
  other_user_id: string | null;
  other_user_name: string | null;
  other_user_avatar_url: string | null;
  item_title: string | null;
  item_price: number | null;
  image_urls: string[] | null;
  post_type: string | null;
  last_message_body: string | null;
  last_message_created_at: string | null;
  has_unread: boolean;
};

export default async function MessagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Get current logged-in user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // not logged in, no access
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-slate-500 text-lg">Please log in to view your messages.</p>
      </div>
    );
  }

  // set user id
  const userID = session.user.id;

  const { data, error } = await supabase
    .from("my_convo")
    .select(
      `
    conversation_id,
    other_user_id,              
    other_user_name,
    other_user_avatar_url,
    item_title,
    item_price,
    image_urls,
    post_type,
    last_message_body,
    last_message_created_at,
    has_unread  
  `
    )
    .eq("current_user_id", userID)
    .order("last_message_created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch conversations:", error.message);
  }

  const conversations: Row[] = data ?? [];
  const convoIds = conversations.map((c) => c.conversation_id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="grid grid-cols-[320px_1fr] h-[calc(100vh-64px)] p-6 pt-12 gap-4 overflow-hidden">
        <MessagesRealtimeRefresher
          currentUserId={userID}
          conversationIds={convoIds}
        />

        {/* Sidebar */}
        <aside className="border border-slate-300 rounded-xl overflow-y-auto shadow-lg">
          <div className="p-4 border-b text-xl font-semibold text-slate-700 bg-gray-100">Messages</div>
          <SidebarList conversations={conversations} />
        </aside>

        {/* Chat Window */}
        <main className="h-full flex flex-col overflow-hidden border rounded-2xl border-slate-300 bg-white shadow-md">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
