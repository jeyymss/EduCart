// /messages/[id]/page.tsx
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

  // ✅ Current user
  const { data: authUser } = await supabase.auth.getUser();
  const currentUserId = authUser?.user?.id ?? "";

  if (!currentUserId) {
    return <div>You must be logged in</div>;
  }

  // ✅ Mark as read
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationIdNumber)
    .eq("participant_user_id", currentUserId);

  // ✅ Messages
  const { data: initialMessages } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, attachments, sender_user_id, body, created_at"
    )
    .eq("conversation_id", conversationIdNumber)
    .order("created_at", { ascending: true })
    .limit(200);

  const { data: convoMeta } = await supabase
    .from("my_convo")
    .select(
      `
      other_user_id,
      other_user_name,
      other_user_avatar_url,
      post_id,
      item_title,
      image_urls,
      post_type,
      item_price
    `
    )
    .eq("conversation_id", conversationIdNumber)
    .single();

  return (
    <ChatClient
      conversationId={conversationIdNumber}
      currentUserId={currentUserId}
      initialMessages={initialMessages ?? []}
      otherUserId={convoMeta?.other_user_id ?? null}
      otherUserName={convoMeta?.other_user_name ?? "User"}
      otherUserAvatarUrl={convoMeta?.other_user_avatar_url ?? null}
      postId={convoMeta?.post_id ?? null}
      itemImage={convoMeta?.image_urls?.[0] ?? null}
      itemTitle={convoMeta?.item_title ?? null}
      postType={convoMeta?.post_type ?? null}
      itemPrice={convoMeta?.item_price ?? null}
    />
  );
}
