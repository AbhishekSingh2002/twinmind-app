import express from "express";
import multer from "multer";
import { transcribeAudio } from "../services/groqService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * POST /transcribe
 * Body: multipart/form-data with 'audio' file + optional 'apiKey'
 */
router.post("/", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file provided." });

    const apiKey = req.body.apiKey || process.env.GROQ_API_KEY;
    const text = await transcribeAudio(req.file.buffer, req.file.mimetype, apiKey);

    res.json({ text, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;