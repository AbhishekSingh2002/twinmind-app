import { transcribeAudio } from "./services/groqService.js";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', ['http://localhost:5173', 'https://twinmind-app-one.vercel.app']);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Handle multipart form data for Vercel
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Get API key
    let apiKey = process.env.GROQ_API_KEY;
    let audioBuffer = null;

    // Parse form data using Vercel's built-in parser
    if (req.body) {
      if (req.body.apiKey) {
        apiKey = req.body.apiKey;
      }
      
      // Handle file upload
      if (req.body.audio && req.body.audio.buffer) {
        audioBuffer = Buffer.from(req.body.audio.buffer);
      }
    }

    if (!audioBuffer) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const text = await transcribeAudio(audioBuffer, 'audio/webm', apiKey);
    res.json({ text, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('[Transcribe Error]', error.message);
    res.status(500).json({ error: error.message || 'Transcription failed' });
  }
}
