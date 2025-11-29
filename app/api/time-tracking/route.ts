import { NextResponse } from "next/server";
import { addTimeTracking } from "@/lib/db/mutations";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const entry = await addTimeTracking(data);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error adding time tracking:", error);
    return NextResponse.json({ error: "Failed to add time tracking" }, { status: 500 });
  }
}

