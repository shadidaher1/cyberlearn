import 'server-only'

import { env } from '@/lib/env'

interface Mail {
  to: string
  subject: string
  text: string
}

/**
 * Transactional email sender.
 *
 * Until `RESEND_API_KEY` is configured, this logs the message (including any
 * link) to the server console so the verification / reset flows are fully
 * testable in development. When the key is set, the Resend backend is wired in
 * here — the call sites don't change.
 */
async function send(mail: Mail): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.info(
      `\n──────── [mailer:dev] ────────\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n──────────────────────────────\n`,
    )
    return
  }

  // TODO(resend): with RESEND_API_KEY set, send via the `resend` SDK here.
  console.info(`[mailer] Resend backend pending — would send "${mail.subject}" to ${mail.to}`)
}

export function sendVerificationEmail(to: string, link: string): Promise<void> {
  return send({
    to,
    subject: 'Verify your CyberLearn email',
    text: `Confirm your email to start capturing flags:\n\n${link}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
  })
}

export function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  return send({
    to,
    subject: 'Reset your CyberLearn password',
    text: `Reset your password using the link below:\n\n${link}\n\nThis link expires in 1 hour. If you didn't request a reset, ignore this email.`,
  })
}
