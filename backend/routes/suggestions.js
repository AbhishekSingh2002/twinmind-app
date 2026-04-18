import express from "express";
import { getSuggestions, getDetailedAnswer } from "../services/groqService.js";

const router = express.Router();

/**
 * POST /suggestions
 * Body: { transcript: string, apiKey?: string }
 * Returns: Array of 3 suggestion objects
 */
router.post("/", async (req, res, next) => {
  try {
    const { transcript, apiKey } = req.body;
    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({ error: "Transcript too short to generate suggestions." });
    }

    // Only send the last ~1500 chars for speed + relevance
    const chunk = transcript.slice(-1500);
    const suggestions = await getSuggestions(chunk, apiKey);

    res.json({ suggestions, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /suggestions/expand
 * Body: { transcript: string, suggestion: object, apiKey?: string }
 * Returns: Detailed answer for the clicked suggestion
 */
router.post("/expand", async (req, res, next) => {
  try {
    const { transcript, suggestion, apiKey } = req.body;
    if (!suggestion?.text) return res.status(400).json({ error: "Suggestion text is required." });

    const answer = await getDetailedAnswer(transcript, suggestion, apiKey);
    res.json({ answer, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;