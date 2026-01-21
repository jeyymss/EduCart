interface UniversityRequestResponseProps {
  requesterName: string;
  schoolName: string;
  status: "approved" | "rejected";
  message: string;
}

export function universityRequestResponseTemplate({
  requesterName,
  schoolName,
  status,
  message,
}: UniversityRequestResponseProps): string {
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(requesterName);
  const safeSchool = escapeHtml(schoolName);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const isApproved = status === "approved";
  const statusColor = isApproved ? "#10b981" : "#ef4444";
  const statusBgColor = isApproved ? "#d1fae5" : "#fee2e2";
  const statusText = isApproved ? "Approved" : "Rejected";
  const statusIcon = isApproved ? "✓" : "✗";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>School Request ${statusText} - EduCart</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #102E4A 0%, #1a4a6e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                EduCart
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                School Request Update
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: ${statusBgColor}; color: ${statusColor}; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${statusIcon} Request ${statusText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Dear <strong>${safeName}</strong>,
              </p>
            </td>
          </tr>

          <!-- School Info Card -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      School Requested
                    </p>
                    <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">
                      ${safeSchool}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">
                  ${safeMessage}
                </p>
              </div>
            </td>
          </tr>

          ${isApproved ? `
          <!-- Next Steps for Approved -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #d1fae5; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">
                      What's Next?
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
                      Your school has been added to EduCart! Students and faculty can now register using their institutional email addresses.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : `
          <!-- Info for Rejected -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      Questions?
                    </p>
                    <p style="margin: 0; color: #a16207; font-size: 14px; line-height: 1.6;">
                      If you believe this decision was made in error or have additional information to provide, feel free to submit a new request.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `}

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
                Thank you for your interest in EduCart.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                Best regards,<br />
                <strong>EduCart Admin Team</strong>
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
