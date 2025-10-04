import mongoose, { Schema, models, Document } from "mongoose";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  website?: string;
  location?: string;
  image?: string;
  provider: 'credentials' | 'google' | 'twitter';
  providerId?: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  isEmailVerified: boolean;
  votedPosts: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
  };
}

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  username: { 
    type: String, 
    unique: true, 
    sparse: true, 
    lowercase: true,
    match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters']
  },
  bio: { type: String, maxlength: 500, trim: true },
  walletAddress: { 
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address']
  },
  website: { type: String, trim: true },
  location: { type: String, maxlength: 100, trim: true },
  image: { type: String },
  provider: { 
    type: String, 
    enum: ['credentials', 'google', 'twitter'], 
    default: 'credentials' 
  },
  providerId: { type: String },
  isAdmin: { type: Boolean, default: false },
  isWhitelisted: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  votedPosts: [{ type: String }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  backupCodes: [{ type: String }],
  lastLogin: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  socialLinks: {
    twitter: { type: String },
    github: { type: String },
    linkedin: { type: String },
    discord: { type: String }
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ providerId: 1, provider: 1 });

const User = models.User || mongoose.model<IUser>("User", userSchema);
export default User;
export type { IUser };
