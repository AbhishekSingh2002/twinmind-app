// Simple local server for testing API functions
import transcribeHandler from './transcribe.js';
import suggestionsHandler from './suggestions.js';
import chatHandler from './chat.js';
import expandHandler from './suggestions/expand.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.post('/api/transcribe', transcribeHandler);
app.post('/api/suggestions', suggestionsHandler);
app.post('/api/suggestions/expand', expandHandler);
app.post('/api/chat', chatHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/transcribe');
  console.log('- POST /api/suggestions');
  console.log('- POST /api/suggestions/expand');
  console.log('- POST /api/chat');
  console.log('- GET /api/health');
});
