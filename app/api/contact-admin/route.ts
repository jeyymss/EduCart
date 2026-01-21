import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactAdminTemplate } from "@/lib/emails/contactAdminTemplate";

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

    // Sanitize name for use in email header (remove special characters)
    const sanitizedName = name.replace(/[<>"]/g, "").trim();

    console.log("✉️ Preparing email payload...");
    console.log({
      from: `${sanitizedName} via EduCart <onboarding@resend.dev>`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[EduCart Support] ${subject}`,
    });

    console.log("🚀 Sending email via Resend...");

    // Generate the HTML email template
    const htmlContent = contactAdminTemplate({
      name,
      email,
      subject,
      message,
    });

    // NOTE: Resend requires the "from" address to be from a verified domain.
    // You cannot send from a user's personal email directly.
    // Instead, we use replyTo so the admin can reply directly to the user.
    const response = await resend.emails.send({
      from: `${sanitizedName} via EduCart <onboarding@resend.dev>`,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `[EduCart Support] ${subject}`,
      html: htmlContent,
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
