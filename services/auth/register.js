import User from '../../models/User.js';
import { generateToken } from '../../utils/token.js';
import { findOne, create } from '../../controllers/dbController.js';

export async function registerUser({ name, email, password }) {
  const existing = await findOne(User, { email });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 400;
    throw err;
  }

  const user = await create(User, { name, email, password });
  const token = generateToken({ id: user._id });
  return { user, token };
}
