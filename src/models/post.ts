import mongoose, { Schema, models } from "mongoose";

const postSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    votes: { type: Number, default: 0 },
    votingPeriod: { type: String, required: true }, // e.g., "August 2025"
    isVotingClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Post = models.Post || mongoose.model("Post", postSchema);
export default Post;

