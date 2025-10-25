import nodemailer from 'nodemailer';

export interface ContactNotificationParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Generate HTML email template for contact form notifications
 */
function generateContactNotificationHtml(params: ContactNotificationParams): string {
  const { name, email, subject, message } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">New Contact Form Submission</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; line-height: 24px; color: #525252; margin: 0 0 24px 0;">
                You have received a new message from the VectorCraft contact form:
              </p>

              <!-- Contact Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="font-size: 18px; font-weight: bold; color: #1a1a1a; margin: 0 0 16px 0;">Contact Details</h2>

                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 8px 0;">
                      <strong>Name:</strong> ${name}
                    </p>

                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 8px 0;">
                      <strong>Email:</strong>
                      <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </p>

                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 8px 0;">
                      <strong>Subject:</strong> ${subject}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fefce8; border-radius: 8px; border: 1px solid #fde047; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="font-size: 18px; font-weight: bold; color: #1a1a1a; margin: 0 0 12px 0;">Message</h2>
                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Quick Reply Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background-color: #667eea; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <p style="font-size: 14px; line-height: 20px; color: #737373; margin: 0; text-align: center;">
                This is an automated notification from the VectorCraft contact form.<br>
                Please respond to the customer at their email address above.
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

/**
 * Send contact form notification email to support team
 */
export async function sendContactNotification(params: ContactNotificationParams) {
  const { name, email, subject, message } = params;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const supportEmail = "support@thevectorcraft.com";

  try {
    const emailHtml = generateContactNotificationHtml({
      name,
      email,
      subject,
      message,
    });

    console.log("=== SENDING CONTACT NOTIFICATION VIA SMTP ===");
    console.log("To:", supportEmail);
    console.log("From:", fromEmail);
    console.log("Subject:", `Contact Form: ${subject}`);

    // Create SMTP transporter for Resend
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: fromEmail,
      to: supportEmail,
      replyTo: email, // Set reply-to as the customer's email
      subject: `Contact Form: ${subject}`,
      html: emailHtml,
    });

    console.log("✅ Contact notification sent successfully via SMTP!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return { success: true, data: { id: info.messageId } };
  } catch (error: any) {
    console.error("❌ SMTP Error sending contact notification:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}
