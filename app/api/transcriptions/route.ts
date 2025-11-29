import { NextResponse } from "next/server";
import { addTranscription } from "@/lib/db/mutations";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const transcription = await addTranscription(data);
    return NextResponse.json(transcription);
  } catch (error) {
    console.error("Error adding transcription:", error);
    return NextResponse.json({ error: "Failed to add transcription" }, { status: 500 });
  }
}

