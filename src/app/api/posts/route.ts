import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

// GET: fetch all posts
export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find();
    return NextResponse.json(posts);
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST: create a new post
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { title, description, link } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description required" },
        { status: 400 }
      );
    }

    // Create post with votes defaulting to 0
    const newPost = await Post.create({
      title,
      description,
      link: link || undefined,
      votes: 0,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
