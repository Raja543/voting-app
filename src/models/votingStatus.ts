import mongoose, { Schema, models } from "mongoose";

export interface IVotingStatus {
  _id: string;
  isVotingActive: boolean;
  currentPeriod: string; // e.g., "August 2025"
  votingStartTime?: Date;
  votingEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const votingStatusSchema = new Schema(
  {
    isVotingActive: { type: Boolean, default: false },
    currentPeriod: { type: String, required: true },
    votingStartTime: { type: Date },
    votingEndTime: { type: Date },
  },
  { timestamps: true }
);

// Ensure only one active voting status
votingStatusSchema.index({ isVotingActive: 1 }, { unique: true, partialFilterExpression: { isVotingActive: true } });

const VotingStatus = models.VotingStatus || mongoose.model("VotingStatus", votingStatusSchema);

export default VotingStatus;
