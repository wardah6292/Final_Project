
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { insertApplicationSchema, insertDocumentSchema } from "@shared/schema";

// Initialize OpenAI client using Replit AI Integrations env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Applications ---

  app.get(api.applications.list.path, async (req, res) => {
    const apps = await storage.getApplications();
    res.json(apps);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const app = await storage.createApplication(input);
      res.status(201).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.applications.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.applications.update.input.parse(req.body);
      const updated = await storage.updateApplication(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete(api.applications.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteApplication(id);
    res.status(204).send();
  });

  app.get(api.applications.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const app = await storage.getApplication(id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Fetch associated analysis and cover letter
    const analysis = await storage.getAnalysisResult(id);
    const coverLetter = await storage.getGeneratedCoverLetter(id);

    res.json({ ...app, analysis, coverLetter });
  });

  // --- Documents ---

  app.get(api.documents.list.path, async (req, res) => {
    const docs = await storage.getDocuments();
    res.json(docs);
  });

  app.post(api.documents.create.path, async (req, res) => {
    try {
      const input = api.documents.create.input.parse(req.body);
      const doc = await storage.createDocument(input);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDocument(id);
    res.status(204).send();
  });

  // --- Market Trends ---

  app.get("/api/market-trends", async (req, res) => {
    try {
      const user = (await storage.getUsers())[0];
      const profession = user?.profession || "Software Engineer";

      const prompt = `
        As a career expert, provide the latest market trends and top skills for the profession: "${profession}".
        
        Return a JSON object with:
        - profession: string
        - topSkills: array of 5 most in-demand skills
        - trends: array of 3 current industry trends (short sentences)
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: "You are a helpful career advisor." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      res.json(JSON.parse(content));
    } catch (err) {
      console.error("Market trends failed:", err);
      res.status(500).json({ message: "Failed to fetch market trends" });
    }
  });

  app.post("/api/user/profession", async (req, res) => {
    try {
      const { profession } = req.body;
      if (!profession) return res.status(400).json({ message: "Profession is required" });
      
      const users = await storage.getUsers();
      if (users.length > 0) {
        await storage.updateUserProfession(users[0].id, profession);
      } else {
        await storage.createUser({ profession });
      }
      res.json({ message: "Profession updated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update profession" });
    }
  });

  // --- AI Analysis ---

  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const { jobDescription, cvContent, applicationId } = req.body;

      if (!jobDescription || !cvContent) {
        return res.status(400).json({ message: "Job description and CV content are required" });
      }

      const prompt = `
        You are a career coach helper. Analyze the fit between the following CV and Job Description.
        
        CV:
        ${cvContent.slice(0, 3000)}
        
        Job Description:
        ${jobDescription.slice(0, 3000)}
        
        Return a JSON object with the following fields:
        - fitScore: number (0-100)
        - recommendation: "Apply", "Maybe", or "Skip"
        - matchingSkills: array of strings
        - missingSkills: array of strings
        - atsRisks: array of strings (potential parsing issues or keywords missing)
        - explanation: short 2-3 sentence summary
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      const result = JSON.parse(content);

      // Save to DB if applicationId is provided
      if (applicationId) {
        await storage.createAnalysisResult({
          applicationId,
          ...result
        });
      }

      res.json(result);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      res.status(500).json({ message: "Failed to analyze job fit" });
    }
  });

  app.post(api.analysis.generateCoverLetter.path, async (req, res) => {
    try {
      const { jobDescription, cvContent, company, role, applicationId } = req.body;

      const prompt = `
        Write a friendly, professional cover letter for the role of ${role} at ${company}.
        Use the candidate's CV details and align them with the Job Description.
        Tone: Professional but enthusiastic. Not robotic.
        
        CV:
        ${cvContent.slice(0, 3000)}
        
        Job Description:
        ${jobDescription.slice(0, 3000)}
        
        Return only the cover letter text.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      // Save to DB if applicationId is provided
      if (applicationId) {
        await storage.createGeneratedCoverLetter({
          applicationId,
          content
        });
      }

      res.json({ content });
    } catch (err) {
      console.error("Cover Letter Generation failed:", err);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // --- Seed Data ---
  (async () => {
    try {
      const existingApps = await storage.getApplications();
      if (existingApps.length === 0) {
        console.log("Seeding database...");
        
        await storage.createApplication({
          company: "TechCorp",
          role: "Junior Frontend Developer",
          status: "Applied",
          jobDescription: "We are looking for a React developer with a passion for UI/UX...",
          notes: "Applied via company website. Good vibe.",
          userId: 1
        });
        
        await storage.createApplication({
          company: "StartupX",
          role: "Fullstack Intern",
          status: "Interview",
          jobDescription: "Join our fast-paced team building the next big thing...",
          notes: "Interview scheduled for next Tuesday.",
          userId: 1
        });

        await storage.createApplication({
          company: "BigBank",
          role: "Software Engineer I",
          status: "Saved",
          jobDescription: "Legacy systems migration project...",
          notes: "Need to update CV before applying.",
          userId: 1
        });

        await storage.createDocument({
          userId: 1,
          type: "cv",
          name: "My_Resume_2024.pdf",
          content: "Experienced developer with skills in React, Node.js, and TypeScript..."
        });

        console.log("Database seeded!");
      }
    } catch (err) {
      console.error("Error seeding database:", err);
    }
  })();

  return httpServer;
}
