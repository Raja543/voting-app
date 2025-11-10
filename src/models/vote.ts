import mongoose, { Schema, Document } from "mongoose";


export interface IVote extends Document {
  userId: string;  // email or user _id
  postId: string;  // post they voted for
  votingPeriod: string; // e.g., "October 2025"
  votingSessionId?: string; // reference to VotingStatus._id for the active session
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

// When votes are created for a specific voting session we use votingSessionId
// to isolate votes per session (so starting a new voting session doesn't
// inherit votes from old periods). This index applies only when votingSessionId exists.
voteSchema.index(
  { userId: 1, postId: 1, votingSessionId: 1 },
  { unique: true, partialFilterExpression: { votingSessionId: { $exists: true } } }
);

// Indexes to speed up aggregation queries by session or period.
// Useful for queries like: group by postId where votingSessionId = X
voteSchema.index({ votingSessionId: 1 });
voteSchema.index({ votingSessionId: 1, postId: 1 });
// Fallback index for legacy documents that only have votingPeriod
voteSchema.index({ votingPeriod: 1, postId: 1 });

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

export default Vote;

