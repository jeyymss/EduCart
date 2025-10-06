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

  // ✅ Fetch participant role
  const { data: participantRole } = await supabase
    .from("conversation_participants")
    .select("participant_role")
    .eq("conversation_id", conversationIdNumber)
    .eq("participant_user_id", currentUserId)
    .single();

  // ✅ Messages
  const { data: initialMessages, error: msgError } = await supabase
    .from("messages")
    .select(
      `
    id,
    conversation_id,
    attachments,
    sender_user_id,
    body,
    created_at,
    type,
    transaction_id,
    transactions (
      id,
      item_title,
      rent_duration,
      price,
      offered_item,
      cash_added,
      fulfillment_method,
      payment_method,
      meetup_location,
      meetup_date,
      meetup_time,
      status
    )
    `
    )
    .eq("conversation_id", conversationIdNumber)
    .order("created_at", { ascending: true })
    .limit(200);

  if (msgError) {
    console.error("❌ Failed to fetch messages:", msgError.message);
  }

  const { data: convoMeta, error: metaError } = await supabase
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
    item_price,
    item_trade,
    item_service_fee,
    item_pasabuy_location,
    item_pasabuy_cutoff
  `
    )
    .eq("conversation_id", conversationIdNumber)
    .eq("current_user_id", currentUserId)
    .single();

  if (metaError) {
    console.error("❌ Failed to fetch convoMeta:", metaError.message);
  }

  // ✅ Fetch all past transactions between the two users
  let transactionHistory: any[] = [];

  if (convoMeta?.other_user_id) {
    const { data: history, error: historyError } = await supabase
      .from("transaction_records")
      .select("*")
      .or(
        `and(buyer_id.eq.${currentUserId},seller_id.eq.${convoMeta.other_user_id}),and(buyer_id.eq.${convoMeta.other_user_id},seller_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (historyError) {
      console.error(
        "❌ Failed to fetch transaction history:",
        historyError.message
      );
    } else {
      transactionHistory = history ?? [];
    }
  }

  return (
    <ChatClient
      conversationId={conversationIdNumber}
      currentUserId={currentUserId}
      currentUserRole={participantRole?.participant_role}
      initialMessages={initialMessages ?? ([] as any)}
      otherUserId={convoMeta?.other_user_id ?? null}
      otherUserName={convoMeta?.other_user_name ?? "User"}
      otherUserAvatarUrl={convoMeta?.other_user_avatar_url ?? null}
      postId={convoMeta?.post_id ?? null}
      itemImage={convoMeta?.image_urls?.[0] ?? null}
      itemTitle={convoMeta?.item_title ?? null}
      postType={convoMeta?.post_type ?? null}
      itemPrice={convoMeta?.item_price ?? null}
      itemTrade={convoMeta?.item_trade ?? null}
      itemServiceFee={convoMeta?.item_service_fee ?? null}
      itemPasabuyLocation={convoMeta?.item_pasabuy_location ?? null}
      itemPasabuyCutoff={convoMeta?.item_pasabuy_cutoff ?? null}
      transactionHistory={transactionHistory}
    />
  );
}
