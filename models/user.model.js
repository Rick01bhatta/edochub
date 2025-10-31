import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  // Required fields for registration
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't return password in queries by default
  },

  // Optional fields - filled during profile completion
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    default: null
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age must be less than 150'],
    default: null
  },
  height: {
    type: Number, // Store in cm for consistency
    min: [50, 'Height must be at least 50cm'],
    max: [300, 'Height must be less than 300cm'],
    default: null
  },
  weight: {
    type: Number, // Store in kg for consistency
    min: [1, 'Weight must be at least 1kg'],
    max: [500, 'Weight must be less than 500kg'],
    default: null
  },
  bloodGroup: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: '{VALUE} is not a valid blood group'
    },
    default: null
  },
  sex: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: '{VALUE} is not a valid option'
    },
    default: null
  },
  maritalStatus: {
    type: String,
    enum: {
      values: ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'],
      message: '{VALUE} is not a valid marital status'
    },
    default: null
  },

  // System fields
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'DOCTOR'],
    default: 'USER'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },

  // Password reset fields
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },

  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

// Pre-save middleware to validate and hash password
userSchema.pre('save', async function(next) {
  // Only process if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    // Validate password length before hashing
    if (this.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const requiredFields = ['phone', 'age', 'height', 'weight', 'bloodGroup', 'sex'];
  const isComplete = requiredFields.every(field => this[field] !== null && this[field] !== undefined);
  
  if (this.isProfileComplete !== isComplete) {
    this.isProfileComplete = isComplete;
  }
  
  return isComplete;
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken; // Return unhashed token to send via email
};

// Static method to find user with valid reset token
userSchema.statics.findByResetToken = function(hashedToken) {
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

// Virtual for BMI calculation
userSchema.virtual('bmi').get(function() {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

const User = mongoose.model('User', userSchema);

// ES6 module export (NOT CommonJS)
export default User;