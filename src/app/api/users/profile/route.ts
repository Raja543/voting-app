import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  // Check if admin is requesting another user's profile
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  let user;
  if (userId && session.user.isAdmin) {
    // Admin can fetch any user's profile
    user = await User.findById(userId).select("-password -twoFactorSecret -backupCodes");
  } else {
    // Regular user can only fetch their own profile
    user = await User.findOne({ email: session.user.email }).select("-password -twoFactorSecret -backupCodes");
  }
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await request.json();

  const { name, username, bio, walletAddress, website, location, socialLinks, currentPassword, newPassword } = body;

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (username && username !== user.username) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3-20 characters and contain only letters, numbers, underscores" }, { status: 400 });
    }
    const existingUsername = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }
  }

  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    if (!user.password) {
      return NextResponse.json({ error: "Password change not allowed for OAuth users" }, { status: 400 });
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  user.name = name ?? user.name;
  user.username = username ? username.toLowerCase() : user.username;
  user.bio = bio ?? user.bio;
  user.walletAddress = walletAddress ?? user.walletAddress;
  user.website = website ?? user.website;
  user.location = location ?? user.location;
  user.socialLinks = socialLinks ?? user.socialLinks;

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password -twoFactorSecret -backupCodes");

  return NextResponse.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
}
