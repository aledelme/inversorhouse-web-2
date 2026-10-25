import "server-only";

import { createTransport, type SendMailOptions } from "nodemailer";

import { env } from "@/lib/env";

export type EmailData = {
  to?: string[];
  bcc?: string[];
  subject: string;
  /** Plain-text body: what mail clients show when copying, and the fallback for `html`. */
  text: string;
  html: string;
  attachments?: SendMailOptions["attachments"];
};

/**
 * Sends an email through Gmail SMTP (ADR-0013), as v1 did.
 * Returns false (without sending) when the credentials are not configured, e.g. locally.
 * Never logs recipients or content: they may contain personal data.
 */
export async function sendEmail({ to, bcc, subject, text, html, attachments }: EmailData) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return false;

  const transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM ?? env.EMAIL_USER,
      to,
      bcc,
      subject,
      text,
      html,
      attachments,
    });
    return true;
  } catch (error) {
    // SMTP messages can echo addresses: log only the error codes.
    const { code, responseCode } = (error ?? {}) as { code?: string; responseCode?: number };
    console.error("Error sending email", { code, responseCode });
    return false;
  }
}
