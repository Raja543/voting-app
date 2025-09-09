// // app/api/votes/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { dbConnect } from "@/lib/mongodb";
// import User from "@/models/user";
// import Post from "@/models/post";
// import Vote from "@/models/vote";
// import { authOptions } from "../auth/[...nextauth]/route";

// // Define request body type
// interface VoteRequestBody {
//   postId: string;
// }

// // ✅ POST: cast a vote
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Not logged in" }, { status: 401 });
//     }

//     await dbConnect();

//     const user = await User.findOne({ email: session.user.email });
//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     if (!user.isWhitelisted) {
//       return NextResponse.json({ error: "You are not whitelisted" }, { status: 403 });
//     }

//     // Ensure body is parsed safely
//     let body: VoteRequestBody;
//     try {
//       body = (await req.json()) as VoteRequestBody;
//     } catch {
//       return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//     }

//     const postId = body.postId;
//     if (!postId) {
//       return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
//     }

//     const post = await Post.findById(postId);
//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     // check if user already voted for this post
//     const existingVote = await Vote.findOne({ userEmail: session.user.email, postId });
//     if (existingVote) {
//       return NextResponse.json({ error: "You have already voted for this post" }, { status: 403 });
//     }

//     // create vote record
//     await Vote.create({ userEmail: session.user.email, postId });

//     // increment post votes
//     post.votes += 1;
//     await post.save();

//     return NextResponse.json({ success: true, message: "Vote successful", post });
//   } catch (error: unknown) {
//     console.error("Vote error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // ✅ GET: check if user already voted for any post
// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ hasVoted: false }, { status: 200 });
//     }

//     await dbConnect();

//     const vote = await Vote.findOne({ userEmail: session.user.email });
//     const hasVoted = !!vote;

//     return NextResponse.json({ hasVoted }, { status: 200 });
//   } catch (error: unknown) {
//     console.error("Vote check error:", error);
//     return NextResponse.json({ hasVoted: false }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";
import Post from "@/models/post";
import Vote from "@/models/vote";
import { authOptions } from "../auth/[...nextauth]/route";

// Request body type for casting vote
interface VoteRequestBody {
  postId: string;
}

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
      alert("User not found.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isWhitelisted) {
      alert("You are not whitelisted to vote.");
      return NextResponse.json({ error: "You are not whitelisted" }, { status: 403 });
    }

    const body: VoteRequestBody = await req.json();
    if (!body.postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(body.postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingVote = await Vote.findOne({ userEmail: session.user.email, postId: body.postId });
    if (existingVote) {
      alert("You have already voted for this post.");
      return NextResponse.json({ error: "You have already voted for this post" }, { status: 403 });
    }

    await Vote.create({ userEmail: session.user.email, postId: body.postId });
    post.votes += 1;
    await post.save();

    return NextResponse.json({ success: true, message: "Vote successful", post });
  } catch (error: unknown) {
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
    return NextResponse.json({ hasVoted: !!vote }, { status: 200 });
  } catch (error: unknown) {
    console.error("Vote check error:", error);
    return NextResponse.json({ hasVoted: false }, { status: 500 });
  }
}
