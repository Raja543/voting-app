import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import VotingStatus from "@/models/votingStatus";
import Post from "@/models/post";
import Vote from "@/models/vote";
import VotingResult from "@/models/votingResults";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Get current voting status
export async function GET() {
  try {
    await dbConnect();

    const votingStatus = await VotingStatus.findOne({ isVotingActive: true });

    if (!votingStatus) {
      return NextResponse.json({
        isVotingActive: false,
        currentPeriod: null,
        votingEndTime: null,
        timeRemaining: null,
      });
    }

    const now = new Date();
    const timeRemaining = votingStatus.votingEndTime
      ? Math.max(0, votingStatus.votingEndTime.getTime() - now.getTime())
      : null;

    return NextResponse.json({
      isVotingActive: votingStatus.isVotingActive,
      currentPeriod: votingStatus.currentPeriod,
      votingStartTime: votingStatus.votingStartTime,
      votingEndTime: votingStatus.votingEndTime,
      timeRemaining,
    });
  } catch (error) {
    console.error("Get voting status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch voting status" },
      { status: 500 }
    );
  }
}

// POST: Start or stop voting
export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { action } = await req.json(); // "start" or "stop"

    if (action === "start") {
      // Get current month and year
      const now = new Date();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear();
      const currentPeriod = `${currentMonth} ${currentYear}`;

      // Check if voting is already active
      const existingStatus = await VotingStatus.findOne({ isVotingActive: true });
      if (existingStatus) {
        return NextResponse.json(
          { error: "Voting is already active" },
          { status: 400 }
        );
      }

      // Create new voting status with end time (2 days from now)
      const votingEndTime = new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000
      ); // 2 days

      const votingStatus = await VotingStatus.create({
        isVotingActive: true,
        currentPeriod,
        votingStartTime: now,
        votingEndTime,
      });

      return NextResponse.json({
        success: true,
        message: `Voting started for ${currentPeriod}`,
        votingStatus,
      });
    } else if (action === "stop") {
      // Find active voting status
      const activeStatus = await VotingStatus.findOne({ isVotingActive: true });
      if (!activeStatus) {
        return NextResponse.json(
          { error: "No active voting found" },
          { status: 400 }
        );
      }

      const now = new Date();
      const currentPeriod = activeStatus.currentPeriod;

      // Get all posts for current voting period
      const posts = await Post.find({
        votingPeriod: currentPeriod,
        isVotingClosed: false,
      }).sort({ createdAt: -1 });

      if (posts.length === 0) {
        return NextResponse.json(
          { error: "No posts found for current voting period" },
          { status: 400 }
        );
      }

      // Get vote counts for each post
      const postsWithVotes = await Promise.all(
        posts.map(async (post) => {
          const voteCount = await Vote.countDocuments({
            postId: post._id.toString(),
          });
          return {
            ...post.toObject(),
            totalVotes: voteCount,
          };
        })
      );

      // Sort by vote count (descending)
      const sortedPosts = postsWithVotes.sort(
        (a, b) => b.totalVotes - a.totalVotes
      );

      // Generate results
      const resultsWithAuthors = await Promise.all(
        sortedPosts.map(async (post, index) => {
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
            votingPeriod: currentPeriod,
          };
        })
      );

      // Mark all posts as voting closed
      await Post.updateMany(
        { votingPeriod: currentPeriod, isVotingClosed: false },
        { isVotingClosed: true }
      );

      // Save results to database (remove existing results for this period first)
      await VotingResult.deleteMany({ votingPeriod: currentPeriod });
      await VotingResult.insertMany(resultsWithAuthors);

      // Update voting status
      await VotingStatus.findByIdAndUpdate(activeStatus._id, {
        isVotingActive: false,
        votingEndTime: now,
      });

      return NextResponse.json({
        success: true,
        message: `Voting closed for ${currentPeriod}. Results generated successfully.`,
        results: resultsWithAuthors,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'start' or 'stop'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Voting status error:", error);
    return NextResponse.json(
      { error: "Failed to update voting status" },
      { status: 500 }
    );
  }
}
