import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "ProfileForge <noreply@profileforge.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;

  if (!resend) {
    console.log("[DEV] Verification email:", url);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your ProfileForge account",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Welcome to ProfileForge</h1>
        <p style="color: #666; line-height: 1.6;">Click the button below to verify your email address and activate your account.</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-weight: 600;">Verify Email</a>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;

  if (!resend) {
    console.log("[DEV] Password reset email:", url);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your ProfileForge password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Password Reset</h1>
        <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Click below to choose a new one.</p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-weight: 600;">Reset Password</a>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email. Link expires in 1 hour.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, username: string) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your ProfileForge profile is ready!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">You're all set, @${username}!</h1>
        <p style="color: #666; line-height: 1.6;">Your profile is live at ${APP_URL}/${username}. Start customizing it in your dashboard.</p>
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-weight: 600;">Open Dashboard</a>
      </div>
    `,
  });
}
