import nodemailer from 'nodemailer';
import { NODE_ENV } from '../config/env.js';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

let transporter;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // In development fallback to a stub that logs the email instead of sending
  transporter = {
    sendMail: async (mailOptions) => {
      // eslint-disable-next-line no-console
      console.log('--- email stub (no SMTP configured) ---');
      // eslint-disable-next-line no-console
      console.log(mailOptions);
      return Promise.resolve();
    },
  };
}

export async function sendOtpEmail({ to, otp }) {
  const subject = 'Your password reset code';
  const text = `Your password reset code is: ${otp}. It will expire in 10 minutes.`;
  const html = `<p>Your password reset code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  });
}
