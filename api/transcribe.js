// api/transcribe.js
// Vercel serverless function — parses multipart/form-data using busboy
// bodyParser MUST be disabled so we can stream raw bytes

import busboy from "busboy";
import { transcribeAudio } from "../services/groqService.js";

export const config = { api: { bodyParser: false } };

/** Parse multipart/form-data from a Vercel/Node request */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files  = {};

    const bb = busboy({ headers: req.headers });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end",  () => {
        files[name] = { buffer: Buffer.concat(chunks), mimetype: info.mimeType };
      });
    });

    bb.on("finish", () => resolve({ fields, files }));
    bb.on("error",  (err) => reject(err));

    req.pipe(bb);
  });
}

function setCors(req, res) {
  const allowed = [
    "http://localhost:5173",
    "https://twinmind-app-one.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // ← string, NOT array
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const ct = req.headers["content-type"] || "";
  if (!ct.includes("multipart/form-data")) {
    return res.status(400).json({ error: "Content-Type must be multipart/form-data" });
  }

  try {
    const { fields, files } = await parseMultipart(req);

    if (!files.audio) {
      return res.status(400).json({ error: "No audio file provided. Use form field name 'audio'." });
    }

    const apiKey = fields.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    const { buffer, mimetype } = files.audio;

    // Skip near-silent chunks
    if (buffer.length < 1000) {
      return res.status(200).json({ text: "", timestamp: new Date().toISOString() });
    }

    const text = await transcribeAudio(buffer, mimetype || "audio/webm", apiKey);
    return res.status(200).json({ text, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error("[/api/transcribe ERROR]", error.message);
    return res.status(500).json({ error: error.message || "Transcription failed" });
  }
}