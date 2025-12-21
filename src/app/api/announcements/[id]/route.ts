import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Announcement from "@/models/announcement";

function getIdFromRequest(request: NextRequest) {
  const url = new URL(request.url);
  return url.pathname.split("/").pop();
}

/* ------------------------------- UPDATE ------------------------------- */

export async function PUT(request: NextRequest) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID missing" },
        { status: 400 }
      );
    }

    const body = await request.json();

    await dbConnect();
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

/* ------------------------------- DELETE ------------------------------- */

export async function DELETE(request: NextRequest) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID missing" },
        { status: 400 }
      );
    }

    await dbConnect();
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}

