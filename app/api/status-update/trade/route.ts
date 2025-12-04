import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { transactionId, newStatus } = await req.json();

    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", transactionId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
