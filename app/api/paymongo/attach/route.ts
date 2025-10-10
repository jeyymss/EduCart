import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { intentId, paymentMethodId } = await req.json();

    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${intentId}/attach`,
      {
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
              payment_method: paymentMethodId,
              return_url: `${
                process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
              }/payment/success`,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PayMongo attach error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Internal error (attach):", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
