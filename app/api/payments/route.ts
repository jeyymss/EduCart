import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, description, email, userName } = await req.json();

    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY!;
    if (!PAYMONGO_SECRET_KEY) {
      throw new Error("Missing PAYMONGO_SECRET_KEY in environment variables");
    }

    // ✅ Minimum PayMongo amount is ₱20.00 (2000 centavos)
    if (amount < 20) {
      return NextResponse.json(
        { error: "Amount must be at least ₱20.00 for GCash payments" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.paymongo.com/v1/sources", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString(
          "base64"
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100, // convert to centavos
            redirect: {
              success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
              failed: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed`,
            },
            type: "gcash",
            currency: "PHP",
            description,
            billing: {
              name: userName || "EduCart User",
              email,
            },
            metadata: {
              user_email: email,
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Server error:", err.message);
    return NextResponse.json(
      { error: "Failed to create PayMongo source" },
      { status: 500 }
    );
  }
}
