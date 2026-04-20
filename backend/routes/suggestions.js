import express from "express";
import { getSuggestions, getDetailedAnswer } from "../services/groqService.js";

const router = express.Router();

/**
 * POST /suggestions
 * Body: { transcript: string, apiKey?: string, settings?: object }
 * Returns: Array of 3 suggestion objects
 */
router.post("/", async (req, res, next) => {
  try {
    const { transcript, apiKey, settings = {} } = req.body;
    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({ error: "Transcript too short to generate suggestions." });
    }

    // Use custom context window or default to 1500
    const contextWindow = settings.suggestionsContextWindow || 1500;
    const chunk = transcript.slice(-contextWindow);
    const suggestions = await getSuggestions(chunk, apiKey, settings);

    res.json({ suggestions, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /suggestions/expand
 * Body: { transcript: string, suggestion: object, apiKey?: string, settings?: object }
 * Returns: Detailed answer for the clicked suggestion
 */
router.post("/expand", async (req, res, next) => {
  try {
    const { transcript, suggestion, apiKey, settings = {} } = req.body;
    if (!suggestion?.text) return res.status(400).json({ error: "Suggestion text is required." });

    const answer = await getDetailedAnswer(transcript, suggestion, apiKey, settings);
    res.json({ answer, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;