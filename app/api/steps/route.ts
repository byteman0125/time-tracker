import { NextResponse } from "next/server";
import { getInterviewSteps } from "@/lib/db/queries";
import { createInterviewStep } from "@/lib/db/mutations";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Step name is required" }, { status: 400 });
    }

    const steps = await getInterviewSteps();
    if (steps.some((step) => step.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: "Step name already exists" }, { status: 409 });
    }

    const maxOrder = steps.reduce((max, step) => Math.max(max, step.order ?? 0), 0);
    const step = await createInterviewStep(name.trim(), maxOrder + 1);

    return NextResponse.json(step);
  } catch (error) {
    console.error("Error creating step:", error);
    return NextResponse.json({ error: "Failed to create step" }, { status: 500 });
  }
}


