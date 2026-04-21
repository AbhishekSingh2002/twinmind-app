# TwinMind - AI Meeting Copilot

🧠 **An intelligent AI-powered meeting assistant that provides real-time transcription, smart suggestions, and context-aware chat capabilities during live conversations.**

---

## ✨ Key Features

- 🎤 **Real-time Transcription** with Whisper Large V3 via Groq
- 🔥 **LLaMA 3.1 70B** for intelligent suggestions and responses
- 🤖 **Smart Suggestions**: Questions, Insights, and Clarifications
- 💬 **Context-aware Chat** with full meeting history
- ⚙️ **Customizable Prompts** and context windows
- 🎨 **Modern Dark UI** with responsive design
- 🚀 **Vercel-Ready** with bulletproof serverless functions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Groq API key** (free tier available)
- **Modern browser** with microphone access

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbhishekSingh2002/twinmind-app.git
cd twinmind-app
```

2. **Install dependencies**
```bash
# API dependencies (root level for Vercel)
npm install

# Frontend dependencies
cd frontend && npm install
```

3. **Set up environment variables**
```bash
# In api/.env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

4. **Start local development**
```bash
# API server (in root directory)
npm run dev:api

# Frontend (in frontend directory)
npm run dev:frontend
```

5. **Open your browser**
Navigate to **http://localhost:5173** and add your Groq API key in Settings.

---

## 🔑 API Key Setup

### Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys in the dashboard
4. Create a new key (starts with `gsk_`)
5. Add it to Settings in the app

---


## 🏗️ Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Groq API      │
│   (React)       │◄──►│   (Express)     │◄──►│   (AI Models)   │
│                 │    │                 │    │                 │
│ • UI Components │    │ • API Routes    │    │ • GPT-OSS 120B  │
│ • State Mgmt    │    │ • AI Integration│    │ • LLaMA Models  │
│ • Audio Capture │    │ • Error Handling│    │ • Whisper V3    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🏗️ Project Structure

```
twinmind-app/
├── api/                     # Vercel Serverless Functions
│   ├── transcribe.js        # Transcription API (self-contained)
│   ├── suggestions.js       # Suggestions API (self-contained)
│   ├── suggestions-expand.js# Expand API (self-contained)
│   ├── chat.js             # Chat API (self-contained)
│   ├── server.js           # Local Express server
│   └── services/           # Legacy service files (not used in Vercel)
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx         # Main component
│   │   │   ├── Settings.jsx    # Settings modal
│   │   │   ├── Suggestions.jsx # Suggestions panel
│   │   │   ├── Chat.jsx        # Chat interface
│   │   │   └── Transcript.jsx  # Transcript display
│   │   └── utils/
│   │       └── api.js          # API client with error handling
│   └── index.html
├── package.json            # Root dependencies for Vercel
├── vercel.json            # Vercel configuration
└── README.md
```

---

## 🤖 AI Models

| Model | Provider | Speed | Quality | Best For |
|-------|----------|-------|---------|----------|
| **LLaMA 3.1 70B** | Groq | Fast | Excellent | Complex reasoning |
| **LLaMA 3.1 8B** | Groq | Very Fast | Good | Quick responses |
| **Mixtral 8x7B** | Groq | Fast | Great | Long conversations |
| **Whisper Large V3** | Groq | Fast | Excellent | Audio transcription |

---

## ⚙️ Configuration

### Custom Prompts
In Settings, you can customize:
- **Suggestions Prompt**: How suggestions are generated
- **Detailed Answers Prompt**: Format for expanded answers
- **Chat Prompt**: System prompt for chat interactions

### Context Windows
- **Suggestions**: 4000 characters (default)
- **Detailed Answers**: 6000 characters (default)
- **Chat**: Full transcript with last 10 messages

---

## 🚀 Deployment

### Vercel Deployment (Production Ready)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to Vercel**
```bash
# From root directory
vercel --prod
```

3. **Set Environment Variables**
In Vercel Dashboard → Environment Variables:
```
GROQ_API_KEY=gsk_your_production_api_key
```

### Vercel Configuration
The app includes a bulletproof Vercel setup:
- ✅ **Self-contained functions** - No import dependencies
- ✅ **Flat file structure** - No nested folder issues
- ✅ **Error handling** - Graceful HTML error response handling
- ✅ **Root package.json** - Proper dependency management

### Local Development

#### API Server
```bash
npm run dev:api
# Runs on http://localhost:5001
```

#### Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 🔧 API Endpoints

- `POST /api/transcribe` - Audio transcription (multipart/form-data)
- `POST /api/suggestions` - Generate suggestions (JSON)
- `POST /api/suggestions-expand` - Expand suggestion with details (JSON)
- `POST /api/chat` - Chat with AI assistant (JSON)

### Request/Response Formats

#### Transcription
```javascript
// Request: FormData
const form = new FormData();
form.append("audio", audioBlob, "chunk.webm");
form.append("apiKey", "gsk_your_key");

// Response
{ "text": "Transcribed audio text..." }
```

#### Suggestions
```javascript
// Request: JSON
{
  "transcript": "Meeting transcript...",
  "apiKey": "gsk_your_key",
  "settings": {}
}

// Response
{
  "suggestions": [
    { "id": "1", "type": "question", "icon": "🙋", "label": "Ask", "text": "..." },
    { "id": "2", "type": "insight", "icon": "💡", "label": "Insight", "text": "..." },
    { "id": "3", "type": "clarification", "icon": "🔍", "label": "Clarify", "text": "..." }
  ]
}
```

---

## 🔧 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your Groq API key starts with `gsk_` and is set in Vercel environment variables
2. **500 Errors**: Check Vercel function logs - all functions are self-contained with comprehensive logging
3. **Audio Not Working**: Check browser microphone permissions
4. **Suggestions Not Generating**: Verify transcript length (minimum 30 characters)
5. **CORS Issues**: Functions handle CORS automatically for allowed origins

### Vercel Deployment Issues

**Fixed Issues:**
- ✅ Import dependency failures - All functions are self-contained
- ✅ Nested folder path issues - Flat file structure used
- ✅ Build failures - Root package.json with proper dependencies
- ✅ JSON parsing errors - Graceful HTML error handling in frontend

### Getting Help
- Check Vercel function logs for detailed error messages
- Verify API keys are correctly configured in Vercel dashboard
- Ensure all dependencies are installed in root package.json
- Check browser console for frontend errors

---

## 🎯 Recent Updates

### v1.0.0 - Production Ready
- ✅ **Bulletproof Vercel deployment** - All import dependencies eliminated
- ✅ **Self-contained functions** - No relative imports, zero dependencies
- ✅ **Error handling improvements** - Graceful HTML error response handling
- ✅ **Flat file structure** - Eliminated nested folder issues
- ✅ **Comprehensive logging** - Debug logging for troubleshooting
- ✅ **Root package.json** - Proper Vercel dependency management

---

## 📄 License

MIT License - see LICENSE file for details.

---

**⭐ If you find this project useful, please give it a star on GitHub!**

*Built with ❤️ for better meetings and smarter conversations*

---

### 🌟 Live Demo

**Check out the live demo:** [TwinMind on Vercel](https://twinmind-app-one.vercel.app)

*Note: Add your Groq API key in Settings to use the live demo*
