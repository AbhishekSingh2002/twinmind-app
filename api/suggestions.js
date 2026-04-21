import { getSuggestions, expandSuggestion } from "../backend/services/groqService.js";

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
    const { transcript, apiKey, settings, suggestion } = req.body;
    const effectiveApiKey = apiKey || process.env.GROQ_API_KEY;

    if (!effectiveApiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    // Handle expand endpoint
    if (req.url.endsWith('/expand') || req.url.includes('/expand')) {
      if (!transcript || !suggestion) {
        return res.status(400).json({ error: "Transcript and suggestion are required" });
      }

      const answer = await expandSuggestion(transcript, suggestion, effectiveApiKey, settings);
      res.json({ answer });
    } 
    // Handle regular suggestions endpoint
    else {
      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
      }

      if (transcript.length < 30) {
        return res.status(400).json({ error: "Transcript too short to generate suggestions" });
      }

      const suggestions = await getSuggestions(transcript, effectiveApiKey, settings);
      res.json({ suggestions });
    }

  } catch (error) {
    console.error('[Suggestions Error]', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate suggestions' });
  }
}
