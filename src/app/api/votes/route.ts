import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/mongodb';
import Vote from '@/models/vote';
import User from '@/models/user';
import Post from '@/models/post';
import { authOptions } from '../auth/[...nextauth]/authOptions';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Check if user is whitelisted
    const user = await User.findOne({ email: session.user.email });
    if (!user?.isWhitelisted) {
      return NextResponse.json(
        { error: 'You need to be whitelisted by admin to vote.' },
        { status: 403 }
      );
    }

    // Get current voting status and use its id as the voting session identifier.
    const VotingStatusModel = await (await import('@/models/votingStatus')).default;
    const votingStatus = await VotingStatusModel.findOne({ isVotingActive: true });
    if (!votingStatus) {
      return NextResponse.json({ error: 'Voting is not active.' }, { status: 403 });
    }
    const votingSessionId = votingStatus._id.toString();

    // Check if user already voted for this post in this voting session.
    // If a votingSessionId is present, we must treat the session as isolated
    // and only consider session-based votes (no fallback to legacy votingPeriod).
    const existingVote = await Vote.findOne({
      userId: session.user.email,
      postId,
      votingSessionId,
    });
    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this post.' },
        { status: 403 }
      );
    }

    // Limit user to 2 votes per voting session. Use session id exclusively when present
    const voteCount = await Vote.countDocuments({ userId: session.user.email, votingSessionId });
    if (voteCount >= 2) {
      return NextResponse.json(
        { error: 'You can only vote for up to 2 posts.' },
        { status: 403 }
      );
    }

    // Try to create the vote and update the post atomically-ish.
    try {
      const createdVote = await Vote.create({
        userId: session.user.email,
        postId,
        votingPeriod: votingStatus.currentPeriod,
        votingSessionId,
      });

      try {
        // Increment post vote count using $inc to avoid recalculating from Vote collection.
        const updatedPost = await Post.findByIdAndUpdate(
          postId,
          { $inc: { votes: 1 } },
          { new: true }
        );

        // If post wasn't found or update failed, rollback the vote we created
        if (!updatedPost) {
          await Vote.deleteOne({ _id: createdVote._id });
          console.error(`Post ${postId} not found — rolled back vote ${createdVote._id}`);
          return NextResponse.json({ error: 'Post not found' }, { status: 400 });
        }

        // Return updated counts so client can update UI immediately
        const totalVotes = updatedPost.votes;
        const userTotalVotes = await Vote.countDocuments({ userId: session.user.email, votingSessionId });

        return NextResponse.json({ success: true, totalVotes, userTotalVotes });
      } catch (postErr) {
        // If updating Post failed, remove the created vote to avoid inconsistency
        try {
          await Vote.deleteOne({ _id: createdVote._id });
        } catch (cleanupErr) {
          console.error('Failed to cleanup vote after post update failure:', cleanupErr);
        }
        console.error('Failed to update post vote count, rolled back vote:', postErr);
        return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
      }
    } catch (err: any) {
      // Handle duplicate key (unique index) errors gracefully
      if (err?.code === 11000) {
        return NextResponse.json({ error: 'Duplicate vote - you may have already voted' }, { status: 409 });
      }
      console.error('Vote create error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    const allPosts = url.searchParams.get('allPosts') === 'true';

    const session = await getServerSession(authOptions);

    // Get current voting period
  const VotingStatusModel = await (await import('@/models/votingStatus')).default;
  const votingStatus = await VotingStatusModel.findOne({ isVotingActive: true });
  const votingSessionId = votingStatus?._id?.toString();
  const votingPeriod = votingStatus?.currentPeriod;

    if (allPosts) {
      // Get vote status for all posts (optimized for multiple posts)
      if (!session?.user?.email || !votingPeriod) {
        return NextResponse.json({ userTotalVotes: 0, voteStatus: {} });
      }

      // Get all user votes in this period in one query
      // Prefer session-based votes; fallback to legacy votingPeriod
      let userVotes = votingSessionId
        ? await Vote.find({ userId: session.user.email, votingSessionId })
        : await Vote.find({ userId: session.user.email, votingPeriod });
      const userTotalVotes = userVotes.length;
      
      // Create a map of postId -> hasVoted
      const voteStatus: Record<string, boolean> = {};
      userVotes.forEach(vote => {
        voteStatus[vote.postId] = true;
      });

      const response = NextResponse.json({ userTotalVotes, voteStatus });
      // Do not publicly cache authenticated user vote state. When a user is
      // logged in we must return fresh data so the UI reflects recent votes.
      if (session?.user?.email) {
        response.headers.set('Cache-Control', 'no-store');
      } else {
        // Allow short caching for anonymous requests
        response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      }
      return response;
    }

    // If sync param is provided, return authoritative vote counts for all posts
    const sync = url.searchParams.get('sync') === 'true';
    if (sync) {
      // Only allow sync when votingPeriod is known
      if (!votingPeriod) {
        return NextResponse.json({ error: 'No active voting period' }, { status: 400 });
      }

      // Build match for active session if available, else fallback to votingPeriod
      const match: any = {};
      if (votingSessionId) {
        match.votingSessionId = votingSessionId;
      } else {
        match.votingPeriod = votingPeriod;
      }

      // Aggregate vote counts per post
      const counts = await Vote.aggregate([
        { $match: match },
        { $group: { _id: '$postId', count: { $sum: 1 } } }
      ]);

      const countsMap: Record<string, number> = {};
      counts.forEach((c: any) => {
        countsMap[c._id] = c.count;
      });

      // For admins, optionally return individual votes when requested
      const includeVotes = url.searchParams.get('includeVotes') === 'true' && session?.user?.isAdmin;
      let votesList = null;
      if (includeVotes) {
        votesList = await Vote.find(match).lean();
      }

      const response = NextResponse.json({ counts: countsMap, votes: votesList });
      // Don't cache sync results
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    // Single post query (keep existing logic for backward compatibility)
    if (!postId || !votingPeriod) {
      return NextResponse.json({ error: 'postId query parameter is required' }, { status: 400 });
    }

      // Get total votes for post in this voting session (prefer session id)
    const votesCount = votingSessionId
      ? await Vote.countDocuments({ postId, votingSessionId })
      : await Vote.countDocuments({ postId, votingPeriod });

    // Check if current user has voted on this post in this period
    let hasVoted = false;
    if (session?.user?.email) {
      const vote = votingSessionId
        ? await Vote.findOne({ postId, userId: session.user.email, votingSessionId })
        : await Vote.findOne({ postId, userId: session.user.email, votingPeriod });
      hasVoted = !!vote;
    }

    return NextResponse.json({ count: votesCount, hasVoted });
  } catch (error) {
    console.error('Vote API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
