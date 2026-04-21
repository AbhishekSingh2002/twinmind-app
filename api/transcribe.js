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

  export const config = {
  api: {
    maxSize: '25mb',
    maxFields: 10,
    maxFiles: 1,
    filter: function ({name, mimetype}) {
      // Keep only audio files
      return mimetype.startsWith('audio/');
    }
  }
};

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
    // For Vercel, we need to handle the raw request differently
    // Check if this is a multipart request
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Get API key from form data or environment
    let apiKey = process.env.GROQ_API_KEY;
    let audioBuffer = null;

    // Handle different ways Vercel might send the data
    if (req.body) {
      // Check if body has parsed form data
      if (req.body.apiKey) {
        apiKey = req.body.apiKey;
      }
      
      // Handle different audio formats
      if (req.body.audio) {
        // Buffer from direct upload
        if (req.body.audio.buffer) {
          audioBuffer = Buffer.from(req.body.audio.buffer);
        } else if (req.body.audio.data) {
          audioBuffer = Buffer.from(req.body.audio.data);
        } else if (typeof req.body.audio === 'string') {
          audioBuffer = Buffer.from(req.body.audio, 'base64');
        }
      }
    } else {
      // Fallback for direct buffer (less common but possible)
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);
      audioBuffer = body;
      apiKey = req.body.apiKey || process.env.GROQ_API_KEY;
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
}
