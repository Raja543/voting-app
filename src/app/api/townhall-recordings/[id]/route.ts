import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import TownhallRecording from "@/models/townhallRecording";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated type
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      gdriveLink,
      recordingDate,
      thumbnailUrl,
      duration,
    } = await request.json();

    await dbConnect();

    const { id } = await context.params; // ✅ await params

    const recording = await TownhallRecording.findByIdAndUpdate(
      id,
      {
        title,
        description,
        gdriveLink,
        recordingDate: recordingDate ? new Date(recordingDate) : undefined,
        thumbnailUrl,
        duration,
      },
      { new: true }
    );

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Error updating townhall recording:", error);
    return NextResponse.json(
      { error: "Failed to update recording" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ updated type
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await context.params; // ✅ await params

    const recording = await TownhallRecording.findByIdAndDelete(id);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting townhall recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
