import { NextResponse } from "next/server";
import { getInterviewById, getTimeTrackingByInterview, getTranscriptionsByInterview } from "@/lib/db/queries";
import { updateInterview } from "@/lib/db/mutations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interview = await getInterviewById(params.id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const [timeEntries, transcriptions] = await Promise.all([
      getTimeTrackingByInterview(params.id),
      getTranscriptionsByInterview(params.id),
    ]);

    return NextResponse.json({
      interview,
      timeEntries,
      transcriptions,
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updated = await updateInterview(params.id, data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}

