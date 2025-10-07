import mongoose, { Schema, Document } from "mongoose";


export interface IVote extends Document {
  userId: string;  // email or user _id
  postId: string;  // post they voted for
  votingPeriod: string; // e.g., "October 2025"
  createdAt: Date;
}


const voteSchema = new Schema(
  {
    userId: { type: String, required: true },
    postId: { type: String, required: true },
    votingPeriod: { type: String, required: true },
  },
  { timestamps: true }
);


// ✅ Compound unique index: one vote per user per post per period
voteSchema.index({ userId: 1, postId: 1, votingPeriod: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

export default Vote;

