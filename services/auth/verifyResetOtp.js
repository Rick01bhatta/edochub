import crypto from 'crypto';
import User from '../../models/User.js';
import { findOne, updateOne } from '../../controllers/dbController.js';
import { generateToken } from '../../utils/token.js';

export async function verifyResetOtp({ email, otp }) {
  const hashed = crypto.createHash('sha256').update(String(otp)).digest('hex');
  const user = await findOne(User, { resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    const err = new Error('OTP is invalid or has expired');
    err.status = 400;
    throw err;
  }

  // OTP is valid — issue a short-lived JWT to allow password reset
  const resetJwt = generateToken({ id: user._id, type: 'reset' }, '15m');

  // clear OTP so it can't be reused
  await updateOne(User, { _id: user._id }, { resetPasswordToken: undefined, resetPasswordExpires: undefined });

  return { resetToken: resetJwt };
}

