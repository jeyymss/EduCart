import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function MessagesIndexPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login"); // 👈 protect the page
  }

  // ✅ query conversations
  const { data, error } = await supabase
    .from("my_convo")
    .select("conversation_id, last_message_created_at")
    .eq("current_user_id", user.id) // 👈 only for this user
    .order("last_message_created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Failed to fetch conversations:", error.message);
  }

  // ✅ redirect only if at least one conversation exists
  if (data && data.length > 0) {
    redirect(`/messages/${data[0].conversation_id}`);
  }

  // ✅ fallback UI when no messages
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-slate-500 text-center">
        No messages yet. Start a chat from a post.
      </p>
    </div>
  );
}
