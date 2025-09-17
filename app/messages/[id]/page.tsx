import { createClient } from "@/utils/supabase/server";
import ChatClient from "./client";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversationIdNumber = Number(id);

  const supabase = await createClient();

  const { data: authUser } = await supabase.auth.getUser();
  const currentUserId = authUser?.user?.id ?? "";

  const { data: initialMessages } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_user_id, body, created_at")
    .eq("conversation_id", conversationIdNumber)
    .order("created_at", { ascending: true })
    .limit(200);

  const { data: convoMeta } = await supabase
    .from("my_convo")
    .select("other_user_name, other_user_avatar_url")
    .eq("conversation_id", conversationIdNumber)
    .single();

  return (
    <ChatClient
      conversationId={conversationIdNumber}
      currentUserId={currentUserId}
      initialMessages={initialMessages ?? []}
      otherUserName={convoMeta?.other_user_name ?? "User"}
      otherUserAvatarUrl={convoMeta?.other_user_avatar_url ?? null}
    />
  );
}
