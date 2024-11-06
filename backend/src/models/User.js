import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['client', 'freelance', 'admin'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: {
    url: String,
    thumbnailUrl: String
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    country: String
  },
  verification: {
    email: {
      verified: {
        type: Boolean,
        default: false
      },
      token: String,
      expiresAt: Date
    }
  },
  consent: {
    cookies: {
      necessary: {
        type: Boolean,
        default: true
      },
      analytics: Boolean,
      marketing: Boolean,
      acceptedAt: Date
    },
    ageVerification: {
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    }
  },
  status: {
    active: {
      type: Boolean,
      default: true
    },
    banned: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);