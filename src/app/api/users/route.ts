import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";

// GET - fetch all users
export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, { password: 0 });
    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST - signup new user OR update whitelist by email
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, username, isWhitelisted } = body;

    // Handle whitelist update (admin only)
    if (email && typeof isWhitelisted === "boolean" && !name && !password) {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { isWhitelisted },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // Handle signup
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Validate username if provided
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ 
        error: "Username must be 3-20 characters and contain only letters, numbers, and underscores" 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        ...(username ? [{ username: username.toLowerCase() }] : [])
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return NextResponse.json({ 
        error: `User with this ${field} already exists` 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username?.toLowerCase(),
      provider: 'credentials',
      isAdmin: false,
      isWhitelisted: false, // Default false
      isEmailVerified: false,
      lastLogin: new Date(),
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        isWhitelisted: newUser.isWhitelisted,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    
    if (err.code === 11000) {
      const field = err.keyPattern?.email ? 'email' : 'username';
      return NextResponse.json({ 
        error: `User with this ${field} already exists` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
