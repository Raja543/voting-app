import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

interface Params {
  params: { id: string };
}

// GET post by ID
export async function GET(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT update post by ID
export async function PUT(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const { title, description, link } = await req.json();
    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      { title, description, link },
      { new: true }
    );
    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE post by ID
export async function DELETE(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const deleted = await Post.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}