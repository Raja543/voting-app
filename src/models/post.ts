import mongoose, { Schema, models } from "mongoose";

const postSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = models.Post || mongoose.model("Post", postSchema);
export default Post;

