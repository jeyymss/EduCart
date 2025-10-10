import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 🟢 Use server-side Supabase client with service key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ must be service role key
  );

  try {
    const body = await req.json();
    const event = body.data.attributes.type;

    console.log("🚀 Webhook received:", event);

    const attributes = body.data.attributes || {};
    const intentData = attributes.data?.attributes || {};
    const description = attributes.description || intentData.description || "";
    const amount = (attributes.amount || intentData.amount || 0) / 100;
    const userEmail =
      attributes.metadata?.user_email ||
      intentData.metadata?.user_email ||
      null;

    console.log("🧾 Details:", { description, amount, userEmail });

    // 💡 Accept both events (some payments only fire `payment.paid`)
    if (event === "payment_intent.succeeded" || event === "payment.paid") {
      if (!userEmail) {
        console.warn("⚠️ No user email found in metadata");
        return NextResponse.json({ message: "No user email" });
      }

      let credits = 0;
      if (description.includes("Individual")) credits = 1;
      if (description.includes("10 Additional")) credits = 10;
      if (description.includes("20 Additional")) credits = 20;

      const { error: rpcError } = await supabase.rpc("add_post_credits", {
        user_email: userEmail,
        credits,
        payment_desc: description,
        payment_amount: amount,
      });

      if (rpcError) {
        console.error("❌ RPC Error:", rpcError);
        return NextResponse.json({ message: "RPC failed", rpcError });
      }

      console.log(`✅ Added ${credits} credits to ${userEmail}`);
    }

    return NextResponse.json({ message: "Webhook received" });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return NextResponse.json(
      { message: "Internal error", error: err },
      { status: 500 }
    );
  }
}
