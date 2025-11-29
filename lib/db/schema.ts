import { pgTable, uuid, text, date, timestamp, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const interviewStatusEnum = pgEnum("interview_status", [
  "scheduled",
  "rescheduled",
  "done",
  "canceled",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  resumeUrl: text("resume_url"),
  personalInfo: jsonb("personal_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interviewSteps = pgTable("interview_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  jobLink: text("job_link"),
  interviewerName: text("interviewer_name").notNull(),
  intervieweeName: text("interviewee_name").notNull(),
  interviewDate: date("interview_date").notNull(),
  currentStepId: uuid("current_step_id").references(() => interviewSteps.id).notNull(),
  status: interviewStatusEnum("status").default("scheduled").notNull(),
  profileId: uuid("profile_id").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastEditedAt: timestamp("last_edited_at").defaultNow().notNull(),
});

export const timeTracking = pgTable("time_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id").references(() => interviews.id).notNull(),
  stepId: uuid("step_id").references(() => interviewSteps.id).notNull(),
  trackedDate: date("tracked_date").notNull(),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id").references(() => interviews.id).notNull(),
  stepId: uuid("step_id").references(() => interviewSteps.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const techInterviews = pgTable("tech_interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id").references(() => interviews.id).notNull(),
  interviewDate: date("interview_date").notNull(),
  interviewerName: text("interviewer_name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  interviews: many(interviews),
}));

export const interviewStepsRelations = relations(interviewSteps, ({ many }) => ({
  interviews: many(interviews),
  timeTracking: many(timeTracking),
  transcriptions: many(transcriptions),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [interviews.profileId],
    references: [profiles.id],
  }),
  currentStep: one(interviewSteps, {
    fields: [interviews.currentStepId],
    references: [interviewSteps.id],
  }),
  timeTracking: many(timeTracking),
  transcriptions: many(transcriptions),
  techInterviews: many(techInterviews),
}));

export const timeTrackingRelations = relations(timeTracking, ({ one }) => ({
  interview: one(interviews, {
    fields: [timeTracking.interviewId],
    references: [interviews.id],
  }),
  step: one(interviewSteps, {
    fields: [timeTracking.stepId],
    references: [interviewSteps.id],
  }),
}));

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  interview: one(interviews, {
    fields: [transcriptions.interviewId],
    references: [interviews.id],
  }),
  step: one(interviewSteps, {
    fields: [transcriptions.stepId],
    references: [interviewSteps.id],
  }),
}));

export const techInterviewsRelations = relations(techInterviews, ({ one }) => ({
  interview: one(interviews, {
    fields: [techInterviews.interviewId],
    references: [interviews.id],
  }),
}));

