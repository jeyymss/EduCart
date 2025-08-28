import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function MessagesIndexPage() {
  const supabaseServerClient = await createClient();

  const { data } = await supabaseServerClient
    .from("my_convo")
    .select("conversation_id, last_message_at, last_message_created_at")
    .order("last_message_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    redirect(`/messages/${data[0].conversation_id}`);
  }

  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-slate-500">
        No messages yet. Start a chat from a post.
      </p>
    </div>
  );
}
