import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, description, email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing user email" }, { status: 400 });
  }

  const response = await fetch("https://api.paymongo.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        process.env.PAYMONGO_SECRET_KEY + ":"
      ).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amount * 100, // in centavos
          payment_method_allowed: ["gcash", "card", "paymaya"],
          currency: "PHP",
          description, // ✅ Include this
          statement_descriptor: "EduCart Marketplace",
          metadata: {
            user_email: email, // ✅ Must be passed here
          },
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ PayMongo create-intent error:", data);
    return NextResponse.json({ error: data }, { status: 400 });
  }

  return NextResponse.json(data);
}
