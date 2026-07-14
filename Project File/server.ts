/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { dbOps } from "./src/server/db";
import { EmotionClassifier } from "./src/server/classifier";
import { EmotionRecord } from "./src/types";

// Setup dotenv
import dotenv from "dotenv";
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize emotion classifier
  const classifier = new EmotionClassifier();

  // Initialize Gemini AI Client for prompt generation
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }

  // Predefined offline template responses
  const EMOTION_TEMPLATES: Record<string, { supportive: string; suggested: string; emoji: string }> = {
    Bored: {
      emoji: "🥱",
      supportive: "It looks like you're feeling a bit disengaged with this task. Sometimes academic material can feel repetitive or dry, but finding a unique angle or a practical application can reignite your interest. Remember that every small step builds foundational strength!",
      suggested: "1. Relate this topic to a real-world project or application you care about.\n2. Work in short 25-minute blocks using the Pomodoro technique, followed by a break.\n3. Search for a visual simulation, interactive sandbox, or educational video to see the concept in action."
    },
    Confident: {
      emoji: "😎",
      supportive: "That is absolutely fantastic! Your confidence shines through, indicating you have a robust grasp of these concepts. Feeling secure in your learning is a wonderful achievement—keep this strong momentum going!",
      suggested: "1. Challenge yourself with a highly complex problem or advanced-level project.\n2. Try explaining this concept to a classmate or peer; teaching is the ultimate test of mastery.\n3. Explore the next sequential topics or advanced theories in this field."
    },
    Confused: {
      emoji: "😕",
      supportive: "Confusion is not a sign of failure—it is actually the very first step toward deep understanding! It means your brain is actively working to form new neural connections. Give yourself permission to be in this state; you are doing great.",
      suggested: "1. Break the problem down into smaller, isolated components and tackle them one by one.\n2. Review the fundamental rules, definitions, or documentation for this topic.\n3. Write down exactly what is causing the block; specifying the confusion often reveals the answer."
    },
    Curious: {
      emoji: "🧐",
      supportive: "Curiosity is the ultimate fuel of all scientific and creative breakthroughs! It is wonderful that you are asking deep questions and want to explore further. Let's harness this inquisitive energy.",
      suggested: "1. Research academic papers, high-level articles, or advanced video lectures on this specific question.\n2. Run a small test or ask 'what if' to experiment with edge cases.\n3. Note down related questions and see if you can trace them to a unified theory."
    },
    Frustrated: {
      emoji: "😫",
      supportive: "I completely hear you. Feeling stuck, seeing errors, or hitting walls is incredibly exhausting and frustrating. It is completely natural to feel this way, but please do not let it defeat you. Taking a step back is a healthy part of the process.",
      suggested: "1. Step away from your computer or study desk for a 10-minute walk or water break to reset.\n2. Write out your reasoning or trace your code line-by-line out loud (rubber-duck debugging).\n3. Seek out a community forum, educator, or peer to share the specific issue and get a fresh set of eyes."
    }
  };

  // --- API Routes ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, name, role, password } = req.body;
      if (!email || !name || !role || !password) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }
      const newUser = dbOps.registerUser(email, name, role, password);
      res.status(201).json({ user: newUser });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      const user = dbOps.loginUser(email, password);
      res.json({ user });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  // Records: Get history
  app.get("/api/records", (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ error: "Email parameter is required" });
        return;
      }
      const records = dbOps.getRecords(email);
      res.json({ records });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Records: Clear history
  app.post("/api/records/clear", (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      dbOps.clearRecords(email);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CSV stats
  app.get("/api/stats", (req, res) => {
    try {
      const stats = dbOps.getCSVStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analyze Emotion and Get Response
  app.post("/api/analyze", async (req, res) => {
    try {
      const { email, field, inputText, modelUsed, aiResponseToggled } = req.body;
      if (!email || !field || !inputText || !modelUsed) {
        res.status(400).json({ error: "Missing required analysis parameters" });
        return;
      }

      // 1. Get predictions from BOTH models for comparative visualization
      const bilstmResult = await classifier.predictBiLSTM(inputText);
      const bertResult = await classifier.predictBERT(inputText);

      // Select active model's result for primary response generation
      const activeResult = modelUsed === "BiLSTM" ? bilstmResult : bertResult;

      // 2. Generate Empathetic Support Response
      let supportiveResponse = "";
      let responseType: "AI" | "Template" = "Template";

      const primaryEmotion = activeResult.primaryEmotion;

      if (aiResponseToggled && ai) {
        try {
          responseType = "AI";
          
          // Constructs a specialized, empathetic prompt for Gemini
          const prompt = `You are an expert educational counselor and learning companion in the field of ${field}.
The student is working on a problem in ${field} and wrote: "${inputText}"
Our sentiment analysis model has detected that the student is feeling "${activeResult.predictedEmotion}" (Confidence: ${(activeResult.confidenceScore * 100).toFixed(1)}%).

Provide an empathetic, personalized, and encouraging response that directly addresses their academic field (${field}) and emotional state. 
Your response MUST be divided into three clear sections:
1. ACKNOWLEDGMENT: Explicitly validate their feelings in a warm, compassionate tone.
2. FIELD-SPECIFIC TIPS: Provide 2 or 3 highly specific tips relative to studying ${field} and overcoming this specific roadblock.
3. ENCOURAGING NEXT STEP: Provide a reassuring, positive closing action they can take.

Format your response cleanly. Use friendly Markdown spacing and formatting.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              temperature: 0.7
            }
          });

          if (response.text) {
            supportiveResponse = response.text.trim();
          } else {
            throw new Error("No response text from Gemini");
          }
        } catch (apiErr) {
          console.error("Gemini Response Generation failed, falling back to local template", apiErr);
          responseType = "Template";
        }
      }

      // Fallback template if AI toggled off, Gemini failed, or no Gemini client
      if (!supportiveResponse) {
        const template = EMOTION_TEMPLATES[primaryEmotion] || EMOTION_TEMPLATES.Confused;
        supportiveResponse = `### ${template.emoji} ${primaryEmotion} detected!

${template.supportive}

#### 📋 Recommended Next Steps in ${field}:
${template.suggested}`;
      }

      // 3. Save Record to Database
      const newRecord: EmotionRecord = {
        recordId: "rec_" + Math.random().toString(36).substring(2, 11),
        email,
        field,
        inputText,
        predictedEmotion: activeResult.predictedEmotion,
        secondaryEmotion: activeResult.secondaryEmotion,
        confidenceScore: activeResult.confidenceScore,
        modelUsed,
        aiResponse: supportiveResponse,
        responseType,
        emotionScores: activeResult.emotionScores,
        timestamp: new Date().toISOString(),
        csvLogged: true,
        cleanedText: activeResult.cleanedText
      };

      dbOps.saveRecord(newRecord);

      // Return both active record and the companion predictions for comparison
      res.status(201).json({
        activeRecord: newRecord,
        comparison: {
          BiLSTM: bilstmResult,
          BERT: bertResult
        }
      });
    } catch (err: any) {
      console.error("Error in /api/analyze", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
