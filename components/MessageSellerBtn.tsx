"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function MessageSellerButton({
  postId,
  className,
}: {
  postId: string
  className?: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [pending, start] = useTransition()

  const startChat = () => {
    if (!postId) {
      alert("Missing postId")
      return
    }

    start(async () => {
      const { data, error } = await supabase.rpc("start_chat_for_post", {
        // 👇 MUST match the SQL function param name
        input_post_id: postId,
      })
      if (error) {
        alert(error.message)
        return
      }
      router.push(`/messages/${data?.conversation_id}`)
    })
  }

  return (
    <Button onClick={startChat} disabled={pending} className={cn(className)}>
      {pending ? "Starting…" : "Message Seller"}
    </Button>
  )
}
