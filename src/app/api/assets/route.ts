import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { dbConnect } from "@/lib/mongodb";
import Asset from "@/models/asset";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    await dbConnect();
    const assets = await Asset.find({}).sort({ createdAt: -1 });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const contentType = request.headers.get("content-type") || "";
    let title: string | null = null;
    let description: string | null = null;
    let type: string | null = null;
    let category: string | null = null;
    let gdriveLink: string | null = null;
    let fileUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") as string) || null;
      description = (formData.get("description") as string) || null;
      type = (formData.get("type") as string) || null;
      category = (formData.get("category") as string) || null;
      gdriveLink = (formData.get("gdriveLink") as string) || null;

      const file = formData.get("file") as File | null;

      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
        await fs.mkdir(uploadDir, { recursive: true });

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);
        fileUrl = `/uploads/assets/${fileName}`;
      }
    } else {
      const body = await request.json();
      title = body.title || null;
      description = body.description || null;
      type = body.type || null;
      category = body.category || null;
      gdriveLink = body.gdriveLink || null;
    }

    if (!title || !type || (!fileUrl && !gdriveLink)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const asset = new Asset({
      title,
      description: description || undefined,
      gdriveLink: fileUrl || gdriveLink,
      type,
      category: category || undefined,
    });

    await asset.save();
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
