import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import Vote from "@/models/vote";
import { authOptions } from "../auth/[...nextauth]/route";

// ✅ Cast a vote
export async function POST(req: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // ✅ Check if user already voted
    const existingVote = await Vote.findOne({ userId: session.user.email });
    if (existingVote) {
      return NextResponse.json(
        { error: "You can only vote once overall" },
        { status: 403 }
      );
    }

    // ✅ Save new vote
    await Vote.create({
      userId: session.user.email,
      postId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vote API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Check vote status OR get post vote count
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    // 🔹 If postId is passed → return count
    if (postId) {
      const count = await Vote.countDocuments({ postId });
      return NextResponse.json({ count }, { status: 200 });
    }

    // 🔹 Else check user status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ hasVoted: false }, { status: 200 });
    }

    const vote = await Vote.findOne({ userId: session.user.email });
    return NextResponse.json({ hasVoted: !!vote }, { status: 200 });
  } catch (error) {
    console.error("Vote check error:", error);
    return NextResponse.json({ hasVoted: false }, { status: 500 });
  }
}
