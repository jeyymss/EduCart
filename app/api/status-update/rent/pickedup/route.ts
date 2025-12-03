import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    const supabase = await createClient();

    const { error } = await supabase
      .from("transactions")
      .update({ status: "PickedUp" })
      .eq("id", transactionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update to PickedUp" },
      { status: 500 }
    );
  }
}
