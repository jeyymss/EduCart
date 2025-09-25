"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  postId: string;
  sellerId: string;
  className?: string;
};

export default function MessageSellerButton({
  postId,
  sellerId,
  className,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function handleMessageSeller() {
    const { data: conversationId, error } = await supabase.rpc(
      "start_chat_with_user",
      {
        input_post_id: postId,
        input_user_id: sellerId,
      }
    );

    if (error) {
      console.error("❌ Failed to start chat:", error.message);
      return;
    }

    if (conversationId) {
      router.push(`/messages/${conversationId}`);
    }
  }

  return (
    <Button onClick={handleMessageSeller} className={className}>
      Message Seller
    </Button>
  );
}
