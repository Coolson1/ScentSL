import { NextResponse } from "next/server";
import { Resend } from "resend";



const BUSINESS_EMAIL = "scentsl001@gmail.com";

/**
 * POST /api/contact
 *
 * Receives a support/help message from the footer contact form
 * and forwards it to the business Gmail via Resend.
 */
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Contact API] RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const body = await req.json();
    const { name, message } = body as { name?: string; message?: string };

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "ScentSL Contact Form <onboarding@resend.dev>",
      to: BUSINESS_EMAIL,
      replyTo: BUSINESS_EMAIL,
      subject: `New message from ${name.trim()} — ScentSL Support`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
          <h2 style="font-size: 22px; font-weight: 400; letter-spacing: 0.05em; border-bottom: 1px solid #c9a96e; padding-bottom: 12px; margin-bottom: 24px; color: #c9a96e;">
            New Support Message — ScentSL
          </h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; width: 80px;">From</td>
              <td style="padding: 8px 0; font-size: 15px;">${escapeHtml(name.trim())}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 20px; background: #f9f6f0; border-left: 3px solid #c9a96e;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 10px;">Message</p>
            <p style="font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${escapeHtml(message.trim())}</p>
          </div>

          <p style="margin-top: 32px; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em;">
            Sent via the ScentSL website footer contact form
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Contact API] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[Contact API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/** Escape HTML special characters to prevent injection in the email body */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
