// POST /api/status-update/emergency/pickedup
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { transactionId } = await req.json();

  if (!transactionId)
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });

  const { error } = await supabase
    .from("transactions")
    .update({ status: "PickedUp" })
    .eq("id", transactionId);

  if (error) {
    console.error("Emergency picked up error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
