import { db } from "./index";
import {
  interviews,
  interviewSteps,
  timeTracking,
  transcriptions,
  techInterviews,
} from "./schema";
import { eq, desc, and, gte, lte, or, ilike } from "drizzle-orm";

export async function getInterviewSteps() {
  return await db.select().from(interviewSteps).orderBy(interviewSteps.order);
}

export async function getAllInterviews() {
  return await db.select().from(interviews).orderBy(desc(interviews.updatedAt));
}

export async function getInterviewsByStep(stepId: string) {
  return await db
    .select()
    .from(interviews)
    .where(eq(interviews.currentStepId, stepId))
    .orderBy(desc(interviews.updatedAt));
}

export async function getInterviewById(id: string) {
  const result = await db
    .select()
    .from(interviews)
    .where(eq(interviews.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getInterviewsByDateRange(startDate: Date, endDate: Date) {
  return await db
    .select()
    .from(interviews)
    .where(
      and(
        gte(interviews.interviewDate, startDate.toISOString().split("T")[0]),
        lte(interviews.interviewDate, endDate.toISOString().split("T")[0])
      )
    )
    .orderBy(desc(interviews.updatedAt));
}

export async function searchInterviews(query: string) {
  return await db
    .select()
    .from(interviews)
    .where(
      or(
        ilike(interviews.companyName, `%${query}%`),
        ilike(interviews.position, `%${query}%`),
        ilike(interviews.interviewerName, `%${query}%`)
      )
    )
    .orderBy(desc(interviews.updatedAt));
}

export async function getTimeTrackingByInterview(interviewId: string) {
  return await db
    .select()
    .from(timeTracking)
    .where(eq(timeTracking.interviewId, interviewId))
    .orderBy(desc(timeTracking.trackedDate));
}

export async function getTranscriptionsByInterview(interviewId: string) {
  return await db
    .select()
    .from(transcriptions)
    .where(eq(transcriptions.interviewId, interviewId))
    .orderBy(desc(transcriptions.createdAt));
}

export async function getTechInterviewsByInterview(interviewId: string) {
  return await db
    .select()
    .from(techInterviews)
    .where(eq(techInterviews.interviewId, interviewId))
    .orderBy(desc(techInterviews.interviewDate));
}

export async function getReminderCount() {
  const reminderStep = await db
    .select()
    .from(interviewSteps)
    .where(eq(interviewSteps.name, "Reminder"))
    .limit(1);
  
  if (!reminderStep[0]) return 0;
  
  const result = await db
    .select({ count: interviews.id })
    .from(interviews)
    .where(eq(interviews.currentStepId, reminderStep[0].id));
  
  return result.length;
}

export async function getMetrics() {
  const allInterviews = await db.select().from(interviews);
  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const monthStart = new Date();
  monthStart.setDate(1);
  
  const todayCount = allInterviews.filter(
    (i) => i.interviewDate === today
  ).length;
  
  const weekCount = allInterviews.filter(
    (i) => i.interviewDate >= weekStart.toISOString().split("T")[0]
  ).length;
  
  const monthCount = allInterviews.filter(
    (i) => i.interviewDate >= monthStart.toISOString().split("T")[0]
  ).length;
  
  const doneCount = allInterviews.filter((i) => i.status === "done").length;
  const totalCount = allInterviews.length;
  const passRate = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  
  return {
    today: todayCount,
    week: weekCount,
    month: monthCount,
    total: totalCount,
    done: doneCount,
    passRate: Math.round(passRate * 100) / 100,
  };
}

