
import { 
  users, documents, applications, analysisResults, generatedCoverLetters,
  type User, type InsertUser,
  type Document, type InsertDocument,
  type Application, type InsertApplication,
  type AnalysisResult, type InsertAnalysisResult,
  type GeneratedCoverLetter, type InsertGeneratedCoverLetter
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfession(id: number, profession: string): Promise<User>;

  // Documents
  getDocuments(userId?: number): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  getDocument(id: number): Promise<Document | undefined>;

  // Applications
  getApplications(userId?: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, app: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;

  // Analysis & Cover Letters
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResult(applicationId: number): Promise<AnalysisResult | undefined>;
  createGeneratedCoverLetter(letter: InsertGeneratedCoverLetter): Promise<GeneratedCoverLetter>;
  getGeneratedCoverLetter(applicationId: number): Promise<GeneratedCoverLetter | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserProfession(id: number, profession: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ profession })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getDocuments(userId?: number): Promise<Document[]> {
    // For prototype, we might ignore userId if it's undefined
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async getApplications(userId?: number): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async updateApplication(id: number, app: Partial<InsertApplication>): Promise<Application> {
    const [updatedApp] = await db.update(applications)
      .set(app)
      .where(eq(applications.id, id))
      .returning();
    return updatedApp;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newResult] = await db.insert(analysisResults).values(result).returning();
    return newResult;
  }

  async getAnalysisResult(applicationId: number): Promise<AnalysisResult | undefined> {
    const [result] = await db.select().from(analysisResults).where(eq(analysisResults.applicationId, applicationId));
    return result;
  }

  async createGeneratedCoverLetter(letter: InsertGeneratedCoverLetter): Promise<GeneratedCoverLetter> {
    const [newLetter] = await db.insert(generatedCoverLetters).values(letter).returning();
    return newLetter;
  }

  async getGeneratedCoverLetter(applicationId: number): Promise<GeneratedCoverLetter | undefined> {
    const [letter] = await db.select().from(generatedCoverLetters).where(eq(generatedCoverLetters.applicationId, applicationId));
    return letter;
  }
}

export const storage = new DatabaseStorage();
