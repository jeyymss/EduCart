import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("platform_wallet_transactions")
        .select(`
            id,
            amount,
            type,
            created_at,
            transaction_id,
            transactions (
                reference_code,
                status,
                
                price,
                delivery_fee,
                payment_method,
                
                buyer:buyer_id (
                id,
                name,
                email
                ),
                seller:seller_id (
                id,
                name,
                email
                )
            )
            `)

        .order("created_at", { ascending: false });


    if (error) {
      console.error("Fetch wallet tx error:", error);
      return NextResponse.json(
        { error: "Failed to load transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: data,
    });
  } catch (err) {
    console.error("Server wallet tx error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
