import { db } from "./index";
import { interviews, interviewSteps, timeTracking, transcriptions, techInterviews } from "./schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function createInterview(data: {
  companyName: string;
  position: string;
  jobLink?: string;
  interviewerName: string;
  intervieweeName: string;
  interviewDate: string;
  currentStepId: string;
  profileId?: string;
}) {
  const result = await db
    .insert(interviews)
    .values({
      ...data,
      status: "scheduled",
    })
    .returning();
  return result[0];
}

export async function updateInterview(
  id: string,
  data: Partial<typeof interviews.$inferInsert>
) {
  const result = await db
    .update(interviews)
    .set({
      ...data,
      updatedAt: sql`now()`,
      lastEditedAt: sql`now()`,
    })
    .where(eq(interviews.id, id))
    .returning();
  return result[0];
}

export async function deleteInterview(id: string) {
  await db.delete(interviews).where(eq(interviews.id, id));
}

export async function createInterviewStep(name: string, order: number) {
  const result = await db
    .insert(interviewSteps)
    .values({ name, order })
    .returning();
  return result[0];
}

export async function updateInterviewStep(
  id: string,
  data: { name?: string; order?: number }
) {
  const result = await db
    .update(interviewSteps)
    .set(data)
    .where(eq(interviewSteps.id, id))
    .returning();
  return result[0];
}

export async function addTimeTracking(data: {
  interviewId: string;
  stepId: string;
  trackedDate: string;
  durationMinutes?: number;
}) {
  const result = await db.insert(timeTracking).values(data).returning();
  return result[0];
}

export async function addTranscription(data: {
  interviewId: string;
  stepId: string;
  content: string;
}) {
  const result = await db.insert(transcriptions).values(data).returning();
  return result[0];
}

export async function updateTranscription(
  id: string,
  content: string
) {
  const result = await db
    .update(transcriptions)
    .set({
      content,
      updatedAt: sql`now()`,
    })
    .where(eq(transcriptions.id, id))
    .returning();
  return result[0];
}

export async function addTechInterview(data: {
  interviewId: string;
  interviewDate: string;
  interviewerName: string;
  notes?: string;
}) {
  const result = await db.insert(techInterviews).values(data).returning();
  return result[0];
}

export async function moveToReminder(interviewId: string, reminderStepId: string) {
  const result = await db
    .update(interviews)
    .set({
      currentStepId: reminderStepId,
      updatedAt: sql`now()`,
    })
    .where(eq(interviews.id, interviewId))
    .returning();
  return result[0];
}

