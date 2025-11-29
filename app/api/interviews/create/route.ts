import { NextResponse } from "next/server";
import { createInterview } from "@/lib/db/mutations";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const interview = await createInterview(data);
    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}

