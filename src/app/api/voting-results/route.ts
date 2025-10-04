import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";
import Vote from "@/models/vote";
import User from "@/models/user";
import VotingResult from "@/models/votingResults";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// POST: Close voting and generate results
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get current month and year
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();
    const votingPeriod = `${currentMonth} ${currentYear}`;

    // Get all posts for current voting period
    const posts = await Post.find({ 
      votingPeriod, 
      isVotingClosed: false 
    }).sort({ createdAt: -1 });
    
    if (posts.length === 0) {
      return NextResponse.json({ error: "No posts found for current voting period" }, { status: 400 });
    }
    
    // Get vote counts for each post
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const voteCount = await Vote.countDocuments({ postId: post._id.toString() });
        return {
          ...post.toObject(),
          totalVotes: voteCount
        };
      })
    );

    // Sort by vote count (descending)
    const sortedPosts = postsWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);

    // Get author information for each post
    const resultsWithAuthors = await Promise.all(
      sortedPosts.map(async (post, index) => {
        // For now, we'll use a placeholder author since posts don't have author info
        // In a real app, you'd want to add author field to posts
        const authorEmail = "unknown@example.com";
        const authorName = "Unknown Author";
        
        return {
          postId: post._id.toString(),
          title: post.title,
          description: post.description,
          link: post.link,
          authorEmail,
          authorName,
          totalVotes: post.totalVotes,
          rank: index + 1,
          votingPeriod
        };
      })
    );

    // Mark all posts as voting closed
    await Post.updateMany(
      { votingPeriod, isVotingClosed: false },
      { isVotingClosed: true }
    );

    // Save results to database (remove existing results for this period first)
    await VotingResult.deleteMany({ votingPeriod });
    await VotingResult.insertMany(resultsWithAuthors);

    return NextResponse.json({ 
      success: true, 
      message: `Voting closed for ${votingPeriod}. Results generated successfully.`,
      results: resultsWithAuthors
    });

  } catch (error) {
    console.error("Close voting error:", error);
    return NextResponse.json({ error: "Failed to close voting" }, { status: 500 });
  }
}

// GET: Retrieve voting results for a specific period
export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const votingPeriod = url.searchParams.get('period');
    
    if (!votingPeriod) {
      return NextResponse.json({ error: "Voting period is required" }, { status: 400 });
    }

    const results = await VotingResult.find({ votingPeriod })
      .sort({ rank: 1 })
      .select('postId title description link authorEmail authorName totalVotes rank votingPeriod createdAt');

    return NextResponse.json(results);

  } catch (error) {
    console.error("Get voting results error:", error);
    return NextResponse.json({ error: "Failed to fetch voting results" }, { status: 500 });
  }
}
