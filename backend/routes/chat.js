import express from "express";
import { getChatAnswer } from "../services/groqService.js";

const router = express.Router();

/**
 * POST /chat
 * Body: { transcript: string, history: Array<{role, content}>, question: string, apiKey?: string }
 * Returns: { answer: string }
 */
router.post("/", async (req, res, next) => {
  try {
    const { transcript, history = [], question, apiKey } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: "Question is required." });

    // Keep only last 10 messages for context window efficiency
    const recentHistory = history.slice(-10);
    const answer = await getChatAnswer(transcript, recentHistory, question, apiKey);

    res.json({ answer, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;