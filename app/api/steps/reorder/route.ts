import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { interviewSteps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const { steps } = await request.json();
    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: "Steps array is required" }, { status: 400 });
    }

    // Update order for each step
    await Promise.all(
      steps.map((step: { id: string; order: number }) =>
        db
          .update(interviewSteps)
          .set({ order: step.order })
          .where(eq(interviewSteps.id, step.id))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering steps:", error);
    return NextResponse.json({ error: "Failed to reorder steps" }, { status: 500 });
  }
}


