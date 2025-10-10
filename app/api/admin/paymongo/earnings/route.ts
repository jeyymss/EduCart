import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.paymongo.com/v1/payments", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.PAYMONGO_SECRET_KEY + ":"
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo Error:", data);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    const payments = data.data || [];

    // Filter only successful (paid) ones
    const successful = payments.filter(
      (p: any) => p.attributes.status === "paid"
    );

    // Sum up all amounts (PayMongo returns centavos)
    const totalEarnings = successful.reduce(
      (sum: number, p: any) => sum + p.attributes.amount / 100,
      0
    );

    return NextResponse.json({
      totalEarnings,
      totalTransactions: successful.length,
    });
  } catch (error) {
    console.error("Error fetching PayMongo payments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
