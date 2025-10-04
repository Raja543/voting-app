import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { dbConnect } from "@/lib/mongodb";
import TownhallRecording from "@/models/townhallRecording";

export async function GET() {
  try {
    await dbConnect();
    const recordings = await TownhallRecording.find({}).sort({ recordingDate: -1 });
    return NextResponse.json(recordings);
  } catch (error) {
    console.error("Error fetching townhall recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, gdriveLink, recordingDate, thumbnailUrl, duration } = await request.json();

    if (!title || !gdriveLink || !recordingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const recording = new TownhallRecording({
      title,
      description,
      gdriveLink,
      recordingDate: new Date(recordingDate),
      thumbnailUrl,
      duration,
    });

    await recording.save();
    return NextResponse.json(recording);
  } catch (error) {
    console.error("Error creating townhall recording:", error);
    return NextResponse.json({ error: "Failed to create recording" }, { status: 500 });
  }
}
