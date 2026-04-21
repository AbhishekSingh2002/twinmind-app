// api/transcribe.js
// Works on both Vercel (serverless) and Express (local-server.js).
// Parses multipart/form-data using busboy — no multer, no body-parser.
// INLINED groqService to eliminate Vercel import dependencies.

import busboy from "busboy";

export const config = { api: { bodyParser: false } };

// ── Inlined Groq Service Functions ──────────────────────────────
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

async function transcribeAudio(audioBuffer, mimeType = "audio/webm", apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  // Convert Node Buffer → Uint8Array so native Blob accepts it correctly
  const uint8 = audioBuffer instanceof Uint8Array
    ? audioBuffer
    : new Uint8Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.byteLength);

  const form = new FormData();
  form.append("file", new Blob([uint8], { type: mimeType }), "audio.webm");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` }, // NO Content-Type here
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Whisper error ${response.status}: ${JSON.stringify(err)}`
    );
  }

  const data = await response.json();
  return data.text || "";
}

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