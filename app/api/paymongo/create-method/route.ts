import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    const response = await fetch(
      "https://api.paymongo.com/v1/payment_methods",
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
              type: "gcash",
              billing: { name, email },
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PayMongo create-method error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Internal error (method):", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
