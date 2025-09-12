import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  userId: string;  // email or user _id
  postId: string;  // post they voted for
  createdAt: Date;
}

const voteSchema = new Schema(
  {
    userId: { type: String, required: true },
    postId: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Compound unique index: one vote per user per post
voteSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

export default Vote;

