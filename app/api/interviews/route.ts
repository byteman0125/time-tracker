import { NextResponse } from "next/server";
import { getInterviewSteps, getAllInterviews } from "@/lib/db/queries";
import { createInterviewStep, moveToReminder, updateInterviewStep } from "@/lib/db/mutations";
import { shouldMoveToReminder } from "@/lib/utils/dateUtils";

export async function GET() {
  try {
    // Ensure default pipeline stages exist
    let existingSteps = await getInterviewSteps();
    const defaultStages = [
      "Intro",
      "Recruiter Screen",
      "Hiring Manager",
      "Technical Loop",
      "CTO",
      "CEO",
      "Offer",
      "Reminder",
    ];

    // Fix incorrectly named stages (e.g., "Recruiter Screen" named as "Intro")
    const stageNameMap: Record<string, number> = {
      "Intro": 1,
      "Recruiter Screen": 2,
      "Hiring Manager": 3,
      "Technical Loop": 4,
      "CTO": 5,
      "CEO": 6,
      "Offer": 7,
      "Reminder": 8,
    };

    // Check for stages that need name correction by order
    let needsRefresh = false;
    for (const [correctName, expectedOrder] of Object.entries(stageNameMap)) {
      const existingStep = existingSteps.find((step) => step.order === expectedOrder);
      const correctStep = existingSteps.find((step) => step.name === correctName);
      
      // If a step with the correct name doesn't exist, but one with the expected order has wrong name
      if (!correctStep && existingStep && existingStep.name !== correctName) {
        // Check if the name is already taken by another step
        const nameTaken = existingSteps.some((s) => s.name === correctName && s.id !== existingStep.id);
        if (!nameTaken) {
          // Fix the name if it's wrong and the correct name is available
          await updateInterviewStep(existingStep.id, { name: correctName });
          needsRefresh = true;
        }
      }
    }

    // Refresh steps if we made corrections
    if (needsRefresh) {
      existingSteps = await getInterviewSteps();
    }

    const missing = defaultStages.filter(
      (name) => !existingSteps.some((step) => step.name === name)
    );

    if (missing.length) {
      const maxOrder =
        existingSteps.reduce((max, step) => Math.max(max, step.order ?? 0), 0) || 0;
      await Promise.all(
        missing.map((name, index) =>
          createInterviewStep(name, maxOrder + index + 1)
        )
      );
    }

    const steps = await getInterviewSteps();
    const reminderStep = steps.find((s) => s.name === "Reminder");

    let allInterviews = await getAllInterviews();

    if (reminderStep) {
      const moves = allInterviews
        .filter(
          (interview) =>
            interview.currentStepId !== reminderStep.id &&
            shouldMoveToReminder(interview.interviewDate)
        )
        .map((interview) => moveToReminder(interview.id, reminderStep.id));

      if (moves.length) {
        await Promise.all(moves);
        allInterviews = await getAllInterviews();
      }
    }

    const interviewsByStep: Record<string, typeof allInterviews> = {};
    steps.forEach((step) => {
      interviewsByStep[step.id] = allInterviews.filter(
        (interview) => interview.currentStepId === step.id
      );
    });

    const reminderCount = reminderStep
      ? interviewsByStep[reminderStep.id]?.length ?? 0
      : 0;

    const metrics = calculateMetrics(allInterviews);

    return NextResponse.json({
      steps,
      interviewsByStep,
      metrics,
      reminderCount,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

function calculateMetrics(interviews: Awaited<ReturnType<typeof getAllInterviews>>) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const counts = {
    today: 0,
    week: 0,
    month: 0,
    total: interviews.length,
    done: 0,
    passRate: 0,
  };

  interviews.forEach((interview) => {
    if (interview.interviewDate === todayStr) counts.today += 1;
    if (interview.interviewDate >= weekStartStr) counts.week += 1;
    if (interview.interviewDate >= monthStart) counts.month += 1;
    if (interview.status === "done") counts.done += 1;
  });

  counts.passRate =
    counts.total > 0 ? Math.round((counts.done / counts.total) * 10000) / 100 : 0;

  return counts;
}

