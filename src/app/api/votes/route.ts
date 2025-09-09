// app/api/votes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";
import Post from "@/models/post";
import Vote from "@/models/vote";
import { authOptions } from "../auth/[...nextauth]/route";

// ✅ POST: cast a vote
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isWhitelisted) {
      return NextResponse.json({ error: "You are not whitelisted" }, { status: 403 });
    }

    // Ensure body is parsed safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const postId = body.postId;
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // check if user already voted for this post
    const existingVote = await Vote.findOne({ userEmail: session.user.email, postId });
    if (existingVote) {
      return NextResponse.json({ error: "You have already voted for this post" }, { status: 403 });
    }

    // create vote record
    await Vote.create({ userEmail: session.user.email, postId });

    // increment post votes
    post.votes += 1;
    await post.save();

    return NextResponse.json({ success: true, message: "Vote successful", post });
  } catch (error: any) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ GET: check if user already voted for any post
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ hasVoted: false }, { status: 200 });
    }

    await dbConnect();

    const vote = await Vote.findOne({ userEmail: session.user.email });
    const hasVoted = !!vote;

    return NextResponse.json({ hasVoted }, { status: 200 });
  } catch (error) {
    console.error("Vote check error:", error);
    return NextResponse.json({ hasVoted: false }, { status: 500 });
  }
}
