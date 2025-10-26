import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import PasswordResetEmail from '@/emails/password-reset';
import PasswordChangedConfirmationEmail from '@/emails/password-changed-confirmation';

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
  tempPassword: string;
}

export interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

export interface SendPasswordChangedEmailParams {
  to: string;
  name: string;
}

/**
 * Generate HTML email template
 */
function generateWelcomeEmailHtml(params: {
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VectorCraft</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0;">Welcome to VectorCraft! 🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; line-height: 24px; color: #525252; margin: 0 0 16px 0;">
                Hi ${params.name},
              </p>

              <p style="font-size: 16px; line-height: 24px; color: #525252; margin: 0 0 24px 0;">
                Thank you for purchasing the VectorCraft Lifetime Deal! We're excited to have you on board. Your account has been created and you now have unlimited access to our AI-powered vector conversion tool.
              </p>

              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 16px 0;">Your Login Credentials</h2>
                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 8px 0;">
                      <strong>Email:</strong> ${params.email}
                    </p>
                    <p style="font-size: 16px; line-height: 24px; color: #1a1a1a; margin: 8px 0;">
                      <strong>Temporary Password:</strong>
                      <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">${params.tempPassword}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fbbf24; margin: 24px 0;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="font-size: 14px; line-height: 20px; color: #92400e; margin: 0;">
                      ⚠️ <strong>Important:</strong> For security reasons, you'll be required to change your password when you log in for the first time.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.loginUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                      Log In to VectorCraft
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <!-- Features -->
              <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 16px 0;">What You Get with Lifetime Access</h2>
              <p style="font-size: 16px; line-height: 28px; color: #525252; margin: 4px 0;">✅ Unlimited vector conversions</p>
              <p style="font-size: 16px; line-height: 28px; color: #525252; margin: 4px 0;">✅ SVG & EPS export formats</p>
              <p style="font-size: 16px; line-height: 28px; color: #525252; margin: 4px 0;">✅ Priority support</p>
              <p style="font-size: 16px; line-height: 28px; color: #525252; margin: 4px 0;">✅ Batch processing</p>
              <p style="font-size: 16px; line-height: 28px; color: #525252; margin: 4px 0;">✅ Lifetime updates & new features</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <p style="font-size: 16px; line-height: 24px; color: #525252; margin: 0 0 24px 0;">
                If you have any questions or need assistance, our support team is here to help. Just reply to this email!
              </p>

              <p style="font-size: 14px; line-height: 24px; color: #737373; margin: 0;">
                Best regards,<br>
                The VectorCraft Team
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
 * Send welcome email with login credentials via SMTP
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams) {
  const { to, name, tempPassword } = params;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const loginUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const emailHtml = generateWelcomeEmailHtml({
      name,
      email: to,
      tempPassword,
      loginUrl: `${loginUrl}/login`,
    });

    console.log("=== SENDING EMAIL VIA SMTP ===");
    console.log("To:", to);
    console.log("From:", fromEmail);

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
      to: to,
      subject: 'Welcome to VectorCraft - Your Lifetime Access is Ready!',
      html: emailHtml,
    });

    console.log("✅ Email sent successfully via SMTP!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return { success: true, data: { id: info.messageId } };
  } catch (error: any) {
    console.error("❌ SMTP Error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

/**
 * Send password reset email via SMTP
 */
export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams) {
  const { to, name, resetUrl } = params;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    console.log("=== SENDING PASSWORD RESET EMAIL VIA SMTP ===");
    console.log("To:", to);
    console.log("From:", fromEmail);

    // Render React Email component to HTML
    const emailHtml = render(
      PasswordResetEmail({ name, resetUrl })
    );

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
      to: to,
      subject: 'Reset Your VectorCraft Password',
      html: emailHtml,
    });

    console.log("✅ Password reset email sent successfully via SMTP!");
    console.log("Message ID:", info.messageId);

    return { success: true, data: { id: info.messageId } };
  } catch (error: any) {
    console.error("❌ SMTP Error (Password Reset):", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

/**
 * Send password changed confirmation email via SMTP
 */
export async function sendPasswordChangedEmail(params: SendPasswordChangedEmailParams) {
  const { to, name } = params;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const loginUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    console.log("=== SENDING PASSWORD CHANGED CONFIRMATION EMAIL VIA SMTP ===");
    console.log("To:", to);
    console.log("From:", fromEmail);

    // Render React Email component to HTML
    const emailHtml = render(
      PasswordChangedConfirmationEmail({ name, loginUrl: `${loginUrl}/login` })
    );

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
      to: to,
      subject: 'Your VectorCraft Password Has Been Changed',
      html: emailHtml,
    });

    console.log("✅ Password changed confirmation email sent successfully via SMTP!");
    console.log("Message ID:", info.messageId);

    return { success: true, data: { id: info.messageId } };
  } catch (error: any) {
    console.error("❌ SMTP Error (Password Changed):", error.message);
    console.error("Full error:", error);
    throw error;
  }
}
