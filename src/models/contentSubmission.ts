import mongoose, { Document, Schema } from "mongoose";

export interface IContentSubmission extends Document {
  twitterHandle: string;
  discordUsername: string;
  contentLink: string;
  contentType: "short-form" | "thread" | "video" | "infographics" | "artwork" | "stream-clip";
  title?: string;
  description?: string;
  submittedBy: string; // User ID
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSubmissionSchema = new Schema<IContentSubmission>(
  {
    twitterHandle: {
      type: String,
      required: true,
      trim: true,
    },
    discordUsername: {
      type: String,
      required: true,
      trim: true,
    },
    contentLink: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["short-form", "thread", "video", "infographics", "artwork", "stream-clip"],
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    submittedBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ContentSubmission || mongoose.model<IContentSubmission>("ContentSubmission", ContentSubmissionSchema);
