import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();
    const supabase = await createClient();

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Random reference code
    const reference_code = `CI-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Fetch user for PayMongo billing
    const { data: user } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    const userEmail = user?.email || "test@example.com";
    const userName = user?.full_name || "EduCart User";

    // PAYMONGO SOURCE
    const paymongoRes = await fetch("https://api.paymongo.com/v1/sources", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        authorization:
          "Basic " +
          Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Number(amount) * 100,
            redirect: {
              success: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL}/wallet/cashin/success?user_id=${userId}&amount=${amount}&ref=${reference_code}`,
              failed: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL}/wallet/cashin/failed`,
            },
            billing: { name: userName, email: userEmail },
            type: "gcash",
            currency: "PHP",
          },
        },
      }),
    });

    const json = await paymongoRes.json();

    if (!json.data) {
      const msg = json.errors?.[0]?.detail || "PayMongo failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // INSERT pending record — ONLY reference_code used
    await supabase.rpc("wallet_create_pending_cash_in", {
      p_user_id: userId,
      p_amount: amount,
      p_reference_code: reference_code,
    });

    return NextResponse.json({
      checkout_url: json.data.attributes.redirect.checkout_url,
    });

  } catch (e) {
    console.error("CASHIN ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
