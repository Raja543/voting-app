import mongoose, { Schema, models, Document } from "mongoose";
import { Types } from "mongoose";

interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  username?: string;
  bio?: string;
  abstractWallet?: string;
  evmWallet?: string;
  provider: 'credentials' | 'google' | 'twitter';
  providerId?: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  isEmailVerified: boolean;
  votedPosts: string[];
  lastLogin?: Date;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
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
  abstractWallet: { type: String },
  evmWallet: { type: String },
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
  lastLogin: { type: Date },
  socialLinks: {
    twitter: { type: String },
    discord: { type: String },
    youtube: { type: String }
  }
}, {
  timestamps: true
});

userSchema.index({ providerId: 1, provider: 1 });

const User = models.User || mongoose.model<IUser>("User", userSchema);
export default User;
export type { IUser };
