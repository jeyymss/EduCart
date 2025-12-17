import { NextResponse } from "next/server";
import { Resend } from "resend";

/* ================= INIT ================= */

console.log("📨 contact-admin route loaded");

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔴 ADMIN EMAIL (receiver)
const ADMIN_EMAIL = "educartmarketplace@gmail.com";

/* ================= POST HANDLER ================= */

export async function POST(req: Request) {
  console.log("➡️ POST /api/contact-admin called");

  try {
    console.log("🔑 Checking RESEND_API_KEY...");
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    console.log("📦 Parsing request body...");
    const body = await req.json();
    console.log("📨 Body received:", body);

    const { name, email, subject, message } = body;

    console.log("🧪 Validating fields...");
    if (!name || !email || !subject || !message) {
      console.error("❌ Missing fields", { name, email, subject, message });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("✉️ Preparing email payload...");
    console.log({
      from: "EduCart Support <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[EduCart Support] ${subject}`,
    });

    console.log("🚀 Sending email via Resend...");

    const response = await resend.emails.send({
      from: "EduCart Support <onboarding@resend.dev>", // MUST be verified
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `[EduCart Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Admin Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    console.log("✅ Resend response:", response);

    return NextResponse.json({
      success: true,
      resendResponse: response,
    });
  } catch (error: any) {
    console.error("🔥 CONTACT ADMIN ERROR");

    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
