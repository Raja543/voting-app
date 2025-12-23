import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import VotingStatus from "@/models/votingStatus";
import Post from "@/models/post";
import Vote from "@/models/vote";
import VotingResult from "@/models/votingResults";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// GET: Get current voting status
export async function GET() {
  try {
    await dbConnect();

    // Use the period saved in votingStatus when available. The period should
    // correspond to the month for which voting is active (current month by default).
    const votingStatus = await VotingStatus.findOne({ isVotingActive: true });

    const now = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentPeriodComputed = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    if (!votingStatus) {
      const res = NextResponse.json({
        isVotingActive: false,
        currentPeriod: null,
        votingEndTime: null,
        timeRemaining: null,
      });

      res.headers.set(
        "Cache-Control",
        "public, s-maxage=5, stale-while-revalidate=30"
      );

      return res;
    }

    const timeRemaining = votingStatus.votingEndTime
      ? Math.max(0, votingStatus.votingEndTime.getTime() - now.getTime())
      : null;

    // Prefer the stored currentPeriod on the votingStatus document; fallback to a computed current month.
    const currentPeriod = votingStatus.currentPeriod || currentPeriodComputed;

    const res = NextResponse.json({
      isVotingActive: votingStatus.isVotingActive,
      currentPeriod: votingStatus.isVotingActive ? currentPeriod : null,
      votingStartTime: votingStatus.votingStartTime,
      votingEndTime: votingStatus.votingEndTime,
      timeRemaining,
    });

    res.headers.set(
      "Cache-Control",
      "public, s-maxage=5, stale-while-revalidate=30"
    );

    return res;
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

  const body = await req.json();
  const action = body?.action;
  // Optional: admins can provide an explicit period (e.g. "October 2025") or
  // a flag `usePreviousMonth` to indicate the period should be the previous month
  // (useful if voting for a month starts after that month ends).
  const explicitPeriod: string | undefined = body?.period;
  const usePreviousMonth: boolean | undefined = body?.usePreviousMonth;

    if (action === "start") {
      // Determine which period to start voting for.
      // Priority: explicitPeriod (if provided) -> previous month (if usePreviousMonth true OR undefined) -> current month
      const now = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      let currentPeriod: string;
      if (explicitPeriod) {
        currentPeriod = explicitPeriod;
      } else {
  // By default, start voting for the current month unless the admin
  // explicitly requests the previous month via `usePreviousMonth: true`.
  const preferPrev = usePreviousMonth === undefined ? false : Boolean(usePreviousMonth);
        if (preferPrev) {
          let prevMonth = now.getMonth() - 1;
          let year = now.getFullYear();
          if (prevMonth < 0) {
            prevMonth = 11;
            year -= 1;
          }
          currentPeriod = `${monthNames[prevMonth]} ${year}`;
        } else {
          currentPeriod = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        }
      }

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
      // Use the stored active period if available; otherwise compute current month.
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const computedCurrentPeriod = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      const currentPeriod = activeStatus.currentPeriod || computedCurrentPeriod;

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
          // Prefer session-based votes (if admin started voting which creates a votingStatus).
          // Use activeStatus._id as the votingSessionId. Fallback to legacy votingPeriod if needed.
          const votingSessionId = activeStatus._id.toString();
          let voteCount = await Vote.countDocuments({ postId: post._id.toString(), votingSessionId });
          if (!voteCount) {
            voteCount = await Vote.countDocuments({ postId: post._id.toString(), votingPeriod: currentPeriod });
          }
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
