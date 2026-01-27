import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import VotingResult from "@/models/votingResults";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// GET: Retrieve all available voting periods (accessible to all users)
export async function GET() {
  try {
    await dbConnect();
    
    // Get distinct voting periods (accessible to all authenticated users)
    const periods = await VotingResult.distinct("votingPeriod");
    
    console.log("Found voting periods:", periods);
    
    // Sort periods in descending order (most recent first)
    const sortedPeriods = periods.sort((a, b) => {
      return b.localeCompare(a);
    });

    return NextResponse.json(sortedPeriods);

  } catch (error) {
    console.error("Get voting periods error:", error);
    return NextResponse.json({ error: "Failed to fetch voting periods" }, { status: 500 });
  }
}
