import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import ContentSubmission from "@/models/contentSubmission";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

function extractTweetId(link: string): string | null {
  try {
    const url = new URL(link);
    if (!url.hostname.includes("twitter.com") && !url.hostname.includes("x.com")) {
      return null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    // twitter.com/{user}/status/{id}
    const statusIndex = parts.findIndex((p) => p === "status");
    if (statusIndex !== -1 && parts[statusIndex + 1]) {
      return parts[statusIndex + 1].split("?")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    if (!TWITTER_BEARER_TOKEN) {
      return NextResponse.json(
        { error: "TWITTER_BEARER_TOKEN is not configured" },
        { status: 500 }
      );
    }

    await dbConnect();

    const submissions = await ContentSubmission.find({
      contentLink: { $regex: /(twitter\.com|x\.com)/i },
    }).lean();

    const tweetIdMap: Record<string, string> = {};
    const tweetIds: string[] = [];

    submissions.forEach((sub) => {
      const id = extractTweetId(sub.contentLink);
      if (id) {
        const key = String(sub._id);
        tweetIdMap[key] = id;
        tweetIds.push(id);
      }
    });

    if (tweetIds.length === 0) {
      return NextResponse.json({ success: true, updated: 0, total: submissions.length });
    }

    const impressionsByTweetId: Record<string, number> = {};

    // Twitter API
    const batchSize = 100;
    for (let i = 0; i < tweetIds.length; i += batchSize) {
      const batch = tweetIds.slice(i, i + batchSize);
      const url = `https://api.twitter.com/2/tweets?ids=${batch.join(",")}&tweet.fields=public_metrics`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      });

      if (!res.ok) {
        console.error("Twitter API error", await res.text());
        continue;
      }

      const data = await res.json();
      const tweets = Array.isArray(data?.data) ? data.data : [];
      for (const tweet of tweets) {
        const id = tweet.id;
        const impressions = tweet.public_metrics?.impression_count;
        if (typeof impressions === "number") {
          impressionsByTweetId[id] = impressions;
        }
      }
    }

    let updated = 0;

    for (const sub of submissions) {
      const idKey = String(sub._id);
      const tweetId = tweetIdMap[idKey];
      if (!tweetId) continue;
      const impressions = impressionsByTweetId[tweetId];
      if (typeof impressions !== "number") continue;

      await ContentSubmission.updateOne(
        { _id: sub._id },
        { $set: { impressions } }
      );
      updated += 1;
    }

    return NextResponse.json({ success: true, updated, total: submissions.length });
  } catch (error) {
    console.error("Sync impressions error:", error);
    return NextResponse.json({ error: "Failed to sync impressions" }, { status: 500 });
  }
}
