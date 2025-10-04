import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import Vote from "@/models/vote";
import Post from "@/models/post";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// ✅ Sync all post vote counts with actual Vote collection data (Admin only)
export async function POST() {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all posts
    const posts = await Post.find();
    
    // Sync vote counts for each post
    const syncResults = await Promise.all(
      posts.map(async (post) => {
        const actualVoteCount = await Vote.countDocuments({ postId: post._id.toString() });
        
        await Post.findByIdAndUpdate(post._id, { votes: actualVoteCount });
        
        return {
          postId: post._id,
          title: post.title,
          oldVotes: post.votes,
          newVotes: actualVoteCount
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: "Vote counts synced successfully",
      results: syncResults
    });
    
  } catch (error) {
    console.error("Sync votes error:", error);
    return NextResponse.json({ error: "Failed to sync votes" }, { status: 500 });
  }
}
