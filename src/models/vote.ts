import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  userId: string;
  postId: string;
  votingPeriod: string;
  votingSessionId?: string;
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


voteSchema.index({ userId: 1, postId: 1, votingPeriod: 1 }, { unique: true });

voteSchema.index(
  { userId: 1, postId: 1, votingSessionId: 1 },
  { unique: true, partialFilterExpression: { votingSessionId: { $exists: true } } }
);

voteSchema.index({ votingSessionId: 1 });
voteSchema.index({ votingSessionId: 1, postId: 1 });
voteSchema.index({ votingPeriod: 1, postId: 1 });

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

export default Vote;

