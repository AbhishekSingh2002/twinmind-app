// api/transcribe.js
// Works on both Vercel (serverless) and Express (local-server.js).
// Parses multipart/form-data using busboy — no multer, no body-parser.

import busboy from "busboy";
import { transcribeAudio } from "../services/groqService.js";

// Vercel: disables its built-in body parser for this route.
// Express local server: this export is simply ignored — that's fine because
// local-server.js deliberately does NOT use express.json() before this route.
export const config = { api: { bodyParser: false } };

/** Stream-parse multipart/form-data from any Node IncomingMessage */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files  = {};

    let bb;
    try {
      bb = busboy({ headers: req.headers });
    } catch (e) {
      return reject(new Error("Failed to initialise busboy: " + e.message));
    }

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end",  () => {
        files[name] = {
          buffer:   Buffer.concat(chunks),
          mimetype: info.mimeType || "audio/webm",
        };
      });
      stream.on("error", reject);
    });

    bb.on("finish", () => resolve({ fields, files }));
    bb.on("error",  (err) => reject(new Error("Busboy error: " + err.message)));

    // Pipe the raw request stream into busboy
    req.pipe(bb);
  });
}

function setCors(req, res) {
  const allowed = [
    "http://localhost:5173",
    "https://twinmind-app-one.vercel.app",
  ];
  const origin = req.headers.origin;
  // Must be a single string value — NOT an array
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
      return res.status(400).json({
        error: "No audio field found. Send FormData with field name 'audio'.",
      });
    }

    const apiKey = fields.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "Groq API key required. Send as form field 'apiKey' or set GROQ_API_KEY env var." });
    }

    const { buffer, mimetype } = files.audio;

    // Skip near-silent / empty chunks rather than sending to Whisper
    if (buffer.length < 1000) {
      return res.status(200).json({ text: "", timestamp: new Date().toISOString() });
    }

    const text = await transcribeAudio(buffer, mimetype, apiKey);
    return res.status(200).json({ text, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error("[/api/transcribe ERROR]", error.message);
    return res.status(500).json({ error: error.message || "Transcription failed" });
  }
}