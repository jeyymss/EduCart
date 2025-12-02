import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { txnId } = await req.json();
  const supabase = await createClient();

  await supabase
    .from("transactions")
    .update({ status: "Paid" })
    .eq("id", txnId);

  return NextResponse.json({ success: true });
}
