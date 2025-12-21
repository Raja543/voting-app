import mongoose, { Document, Schema } from "mongoose";

export interface ITownhallRecording extends Document {
  title: string;
  description?: string;
  gdriveLink: string;
  recordingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TownhallRecordingSchema = new Schema<ITownhallRecording>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    gdriveLink: {
      type: String,
      required: true,
      trim: true,
    },
    recordingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TownhallRecording || mongoose.model<ITownhallRecording>("TownhallRecording", TownhallRecordingSchema);
