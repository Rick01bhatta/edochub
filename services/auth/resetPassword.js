import User from '../../models/User.js';
import { findOneQuery } from '../../controllers/dbController.js';
import { generateToken, verifyToken } from '../../utils/token.js';
import bcrypt from 'bcryptjs';

export async function resetPassword({ token, newPassword }) {
  // token here is expected to be the short-lived reset JWT issued by verifyResetOtp
  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    const err = new Error('Reset token is invalid or has expired');
    err.status = 400;
    throw err;
  }

  if (!payload || payload.type !== 'reset') {
    const err = new Error('Invalid reset token');
    err.status = 400;
    throw err;
  }

  const user = await findOneQuery(User, { _id: payload.id }).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Set the new plain password so the schema pre-save middleware hashes it once
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save(); // pre-save middleware will hash the password

  const tokenJwt = generateToken({ id: user._id });

  // hide password in response
  user.password = undefined;
  return { user, token: tokenJwt };
}