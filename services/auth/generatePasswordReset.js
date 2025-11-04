import crypto from 'crypto';
import User from '../../models/User.js';
import { create, findOne, updateOne } from '../../controllers/dbController.js';
import { sendOtpEmail } from '../../utils/email.js';

// create a numeric OTP and its hashed form
const createOtp = (digits = 6) => {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  const otpStr = String(otp);
  const hashed = crypto.createHash('sha256').update(otpStr).digest('hex');
  return { otp: otpStr, hashed };
};

export async function generatePasswordReset(email) {
  const user = await findOne(User, { email });
  if (!user) {
    const err = new Error('No user with that email');
    err.status = 404;
    throw err;
  }

  // create a short OTP (6 digits) and save its hashed value
  const { otp, hashed } = createOtp(6);
  await updateOne(User, { _id: user._id }, { resetPasswordToken: hashed, resetPasswordExpires: Date.now() + 10 * 60 * 1000 }, { new: true });

  // send OTP via email (in dev this will log the message if SMTP not configured)
  await sendOtpEmail({ to: user.email, otp });

  // do not return the otp in production; return only a success acknowledgement
  return { message: 'OTP sent to email' };
}
