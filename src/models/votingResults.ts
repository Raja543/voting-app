import mongoose, { Schema, models } from "mongoose";

export interface IVotingResult {
  _id: string;
  postId: string;
  title: string;
  description: string;
  link?: string;
  authorEmail: string;
  authorName: string;
  totalVotes: number;
  rank: number;
  votingPeriod: string; // e.g., "August 2024"
  createdAt: Date;
}

const votingResultSchema = new Schema(
  {
    postId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    authorEmail: { type: String, required: true },
    authorName: { type: String, required: true },
    totalVotes: { type: Number, required: true },
    rank: { type: Number, required: true },
    votingPeriod: { type: String, required: true },
  },
  { timestamps: true }
);

// Index for efficient querying by voting period
votingResultSchema.index({ votingPeriod: 1, rank: 1 });

const VotingResult = models.VotingResult || mongoose.model("VotingResult", votingResultSchema);

export default VotingResult;
