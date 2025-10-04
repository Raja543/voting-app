import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import ContentSubmission from "@/models/contentSubmission";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // If admin, return all submissions. If regular user, return only their submissions
    const filter = session.user.isAdmin ? {} : { submittedBy: session.user.id || session.user.email };
    const submissions = await ContentSubmission.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching content submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { twitterHandle, discordUsername, contentLink, contentType, title, description } = await request.json();

    if (!twitterHandle || !discordUsername || !contentLink || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const submission = new ContentSubmission({
      twitterHandle,
      discordUsername,
      contentLink,
      contentType,
      title,
      description,
      submittedBy: session.user.id || session.user.email,
    });

    await submission.save();
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error creating content submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
