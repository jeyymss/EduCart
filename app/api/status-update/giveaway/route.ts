import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { transactionId, status } = await req.json();

  if (!transactionId || !status)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("id", transactionId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
