import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, transactionId, conversationId, reference, totalPayment } = body;

  try {
    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency: "PHP",
            payment_method_types: ["gcash"],

            line_items: [
              {
                currency: "PHP",
                amount: Math.round(amount * 100),
                name: `Transaction ${reference}`,
                quantity: 1,
              },
            ],

            description: `Payment for transaction ${reference}`,
            reference_number: reference,

            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?txn=${transactionId}&conv=${conversationId}&total=${totalPayment}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
          },
        },
      }),
    });

    const json = await response.json();
    console.log("PAYMONGO RESPONSE:", json);

    if (json?.data?.attributes?.checkout_url) {
      return NextResponse.json({
        checkout_url: json.data.attributes.checkout_url,
      });
    }

    return NextResponse.json(
      { error: json.errors ?? "Unknown error" },
      { status: 400 }
    );
  } catch (err) {
    console.error("PayMongo error:", err);
    return NextResponse.json(
      { error: "Server error initializing GCash payment" },
      { status: 500 }
    );
  }
}