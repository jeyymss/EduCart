import { createClient } from "@/utils/supabase/server";
import ChatClient from "./client";

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const conversationIdNumber = Number(params.id);
  const supabaseServerClient = await createClient();

  const { data: authUser } = await supabaseServerClient.auth.getUser();
  const currentUserId = authUser?.user?.id ?? "";

  const { data: initialMessages } = await supabaseServerClient
    .from("messages")
    .select("id, conversation_id, sender_user_id, body, created_at")
    .eq("conversation_id", conversationIdNumber)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <ChatClient
      conversationId={conversationIdNumber}
      currentUserId={currentUserId}
      initialMessages={initialMessages ?? []}
    />
  );
}
