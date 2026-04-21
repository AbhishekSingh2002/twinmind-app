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
    // Handle multipart form data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Parse form data manually for Vercel
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    
    // Simple multipart parsing (basic implementation)
    const boundary = contentType.split('boundary=')[1];
    const parts = body.split(`--${boundary}`);
    
    let audioBuffer = null;
    let apiKey = process.env.GROQ_API_KEY;
    
    for (const part of parts) {
      if (part.includes('name="audio"')) {
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        if (dataStart > 3 && dataEnd > dataStart) {
          audioBuffer = Buffer.from(part.slice(dataStart, dataEnd), 'binary');
        }
      }
      if (part.includes('name="apiKey"')) {
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        if (dataStart > 3 && dataEnd > dataStart) {
          apiKey = part.slice(dataStart, dataEnd).trim();
        }
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
