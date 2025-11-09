import { registerUser } from '../services/auth/register.js';
import { loginUser } from '../services/auth/login.js';
import { generatePasswordReset } from '../services/auth/generatePasswordReset.js';
import { verifyResetOtp } from '../services/auth/verifyResetOtp.js';
import { resetPassword } from '../services/auth/resetPassword.js';

export async function registerController(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(req, res, next) {
  try {
    const { email } = req.body;
    const result = await generatePasswordReset(email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtpController(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await verifyResetOtp({ email, otp });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword({ token, newPassword });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}