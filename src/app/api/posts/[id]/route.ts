import { NextResponse, NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

// GET: fetch a post by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT: update a post by ID
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      link?: string;
    };

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title: body.title, description: body.description, link: body.link },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPost);
  } catch (error: unknown) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE: delete a post by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

