import { NextResponse } from "next/server";
import { searchInterviews, getInterviewsByDateRange } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let results;
    if (startDate && endDate) {
      results = await getInterviewsByDateRange(new Date(startDate), new Date(endDate));
    } else if (query) {
      results = await searchInterviews(query);
    } else {
      return NextResponse.json({ error: "Missing query or date range" }, { status: 400 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}

