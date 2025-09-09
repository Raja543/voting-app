import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
   _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isWhitelisted: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  votedPosts: [{ type: String }]
});

const User = models.User || mongoose.model("User", userSchema);
export default User;