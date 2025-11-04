import User from '../../models/User.js';
import { generateToken } from '../../utils/token.js';
import { findOneQuery } from '../../controllers/dbController.js';

export async function loginUser({ email, password }) {
  const user = await findOneQuery(User, { email })
    .select('+password')
    .exec();
    
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = generateToken({ id: user._id });
  // Do not return password
  user.password = undefined;
  return { user, token };
}
