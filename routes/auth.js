import express from 'express';
import { 
  registerController, 
  loginController, 
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/verify-otp', verifyOtpController);

export default router;
