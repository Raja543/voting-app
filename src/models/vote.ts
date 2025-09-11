import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  userId: string; // email or user _id
  postId: string; // post they voted for
  createdAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    userId: { type: String, required: true },
    postId: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Ensure a user can only vote ONCE overall
voteSchema.index({ userId: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model<IVote>("Vote", voteSchema);

export default Vote;
