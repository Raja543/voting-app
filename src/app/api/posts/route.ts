import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

interface PostBody {
  title: string;
  description: string;
  link?: string;
}

// GET: fetch all posts (only show active voting posts to users)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const showAll = url.searchParams.get('showAll') === 'true';
    
    let query = {};
    if (!showAll) {
      // For regular users, only show posts where voting is not closed
      query = { isVotingClosed: false };
    } else {
      // For admin, show all posts but filter out closed voting posts if needed
      const showClosed = url.searchParams.get('showClosed') === 'true';
      if (!showClosed) {
        query = { isVotingClosed: false };
      }
    }
    
    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    // Add caching headers for better performance
    const response = NextResponse.json(posts);
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    
    return response;
  } catch (err: unknown) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST: create a new post
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: PostBody = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description required" },
        { status: 400 }
      );
    }

    // Get previous month and year (content uploaded in Sep falls into Aug category)
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    let previousMonth = now.getMonth() - 1;
    let year = now.getFullYear();
    
    // Handle January (previous month is December of previous year)
    if (previousMonth < 0) {
      previousMonth = 11; // December
      year = year - 1;
    }
    
    const votingPeriod = `${monthNames[previousMonth]} ${year}`;

    const newPost = await Post.create({
      title: body.title,
      description: body.description,
      link: body.link || undefined,
      votes: 0,
      votingPeriod,
      isVotingClosed: false,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
