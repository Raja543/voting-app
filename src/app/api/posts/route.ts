import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

interface PostBody {
  title: string;
  description: string;
  link?: string;
}

// GET: fetch all posts
export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find();
    return NextResponse.json(posts);
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

    const newPost = await Post.create({
      title: body.title,
      description: body.description,
      link: body.link || undefined,
      votes: 0,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
