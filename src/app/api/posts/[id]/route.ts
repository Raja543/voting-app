import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";

// Type for dynamic route params
interface Params {
  params: { id: string };
}

// GET: fetch a post by ID
export async function GET(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const post = await Post.findById(params.id);
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
interface UpdatePostBody {
  title?: string;
  description?: string;
  link?: string;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const body: UpdatePostBody = await req.json();
    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        description: body.description,
        link: body.link,
      },
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
export async function DELETE(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const deletedPost = await Post.findByIdAndDelete(params.id);
    if (!deletedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
