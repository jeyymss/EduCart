interface ContactAdminEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function contactAdminTemplate({
  name,
  email,
  subject,
  message,
}: ContactAdminEmailProps): string {
  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  // Get current date formatted
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Message - EduCart</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #E59E2C 0%, #d4881f 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                EduCart
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Support Message
              </p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #E59E2C; padding: 12px 16px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                      New support message received from a user
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Info Card -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <!-- From -->
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            From
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 500;">
                            ${safeName}
                          </p>
                        </td>
                      </tr>
                      <!-- Email -->
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Email
                          </p>
                          <a href="mailto:${safeEmail}" style="color: #E59E2C; font-size: 16px; text-decoration: none; font-weight: 500;">
                            ${safeEmail}
                          </a>
                        </td>
                      </tr>
                      <!-- Subject -->
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Subject
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 500;">
                            ${safeSubject}
                          </p>
                        </td>
                      </tr>
                      <!-- Date -->
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                            Received
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            ${date}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Message
              </p>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
                  ${safeMessage}
                </p>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(subject)}"
                       style="display: inline-block; background-color: #E59E2C; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(229, 158, 44, 0.3);">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px;">
                This email was sent from the EduCart Support system.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                You can reply directly to this email to respond to the user.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer Logo -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} EduCart Marketplace. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
