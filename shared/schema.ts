
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll use a simple user model for now, although the app is designed to be local-first/prototype.
// This allows for future expansion if needed.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  profession: text("profession"), // User's stated profession
  onboardingData: jsonb("onboarding_data"), // Stores answers from Q1, Q2
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional if we just use single session for prototype
  type: text("type").notNull(), // 'cv' or 'cover_letter'
  name: text("name").notNull(), // Filename or "Pasted Text"
  content: text("content").notNull(), // The actual text content
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(), // Saved, Applied, Interview, Rejected
  jobDescription: text("job_description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  fitScore: integer("fit_score"),
  recommendation: text("recommendation"), // Apply, Maybe, Skip
  matchingSkills: text("matching_skills").array(),
  missingSkills: text("missing_skills").array(),
  atsRisks: text("ats_risks").array(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedCoverLetters = pgTable("generated_cover_letters", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });
export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({ id: true, createdAt: true });
export const insertGeneratedCoverLetterSchema = createInsertSchema(generatedCoverLetters).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type GeneratedCoverLetter = typeof generatedCoverLetters.$inferSelect;
export type InsertGeneratedCoverLetter = z.infer<typeof insertGeneratedCoverLetterSchema>;

// API Types
export type CreateApplicationRequest = InsertApplication;
export type UpdateApplicationRequest = Partial<InsertApplication>;
export type CreateDocumentRequest = InsertDocument;
