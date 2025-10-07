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

    // Get current voting period
    const votingStatus = await (await import('@/models/votingStatus')).default.findOne({ isVotingActive: true });
    if (!votingStatus) {
      return NextResponse.json({ error: 'Voting is not active.' }, { status: 403 });
    }
    const votingPeriod = votingStatus.currentPeriod;

    // Check if user already voted for this post in this period
    const existingVote = await Vote.findOne({ userId: session.user.email, postId, votingPeriod });
    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this post.' },
        { status: 403 }
      );
    }

    // Limit user to 2 votes per period
    const voteCount = await Vote.countDocuments({ userId: session.user.email, votingPeriod });
    if (voteCount >= 2) {
      return NextResponse.json(
        { error: 'You can only vote for up to 2 posts.' },
        { status: 403 }
      );
    }

    // Record the vote
    await Vote.create({ userId: session.user.email, postId, votingPeriod });

    // Update vote count in posts (for this period)
    const totalVotes = await Vote.countDocuments({ postId, votingPeriod });
    await Post.findByIdAndUpdate(postId, { votes: totalVotes });

    return NextResponse.json({ success: true });
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
    const votingStatus = await (await import('@/models/votingStatus')).default.findOne({ isVotingActive: true });
    const votingPeriod = votingStatus?.currentPeriod;

    if (allPosts) {
      // Get vote status for all posts (optimized for multiple posts)
      if (!session?.user?.email || !votingPeriod) {
        return NextResponse.json({ userTotalVotes: 0, voteStatus: {} });
      }

      // Get all user votes in this period in one query
      const userVotes = await Vote.find({ userId: session.user.email, votingPeriod });
      const userTotalVotes = userVotes.length;
      
      // Create a map of postId -> hasVoted
      const voteStatus: Record<string, boolean> = {};
      userVotes.forEach(vote => {
        voteStatus[vote.postId] = true;
      });

      const response = NextResponse.json({ userTotalVotes, voteStatus });
      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      return response;
    }

    // Single post query (keep existing logic for backward compatibility)
    if (!postId || !votingPeriod) {
      return NextResponse.json({ error: 'postId query parameter is required' }, { status: 400 });
    }

    // Get total votes for post in this period
    const votesCount = await Vote.countDocuments({ postId, votingPeriod });

    // Check if current user has voted on this post in this period
    let hasVoted = false;
    if (session?.user?.email) {
      const vote = await Vote.findOne({ postId, userId: session.user.email, votingPeriod });
      hasVoted = !!vote;
    }

    return NextResponse.json({ count: votesCount, hasVoted });
  } catch (error) {
    console.error('Vote API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
