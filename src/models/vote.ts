import mongoose, { Schema, model, models } from "mongoose";

const VoteSchema = new Schema(
  {
    userEmail: { type: String, required: true }, // user email
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

// Ensure one vote per user per post
VoteSchema.index({ userEmail: 1, postId: 1 }, { unique: true });

export default models.Vote || model("Vote", VoteSchema);