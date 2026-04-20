# TwinMind - AI Meeting Copilot

🧠 **An intelligent AI-powered meeting assistant that provides real-time transcription, smart suggestions, and context-aware chat capabilities during live conversations.**

---

## ✨ Key Features

- 🎤 **Real-time Transcription** with Whisper Large V3 via Groq
- 🔥 **GPT-OSS 120B** for intelligent suggestions and responses
- 🤖 **Smart Suggestions**: Questions, Insights, and Clarifications
- 💬 **Context-aware Chat** with full meeting history
- ⚙️ **Customizable Prompts** and context windows
- 🎨 **Modern Dark UI** with responsive design

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
# Backend
cd backend && npm install

# Frontend (new terminal)
cd frontend && npm install
```

3. **Set up environment variables**
```bash
# In backend/.env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

4. **Start the application**
```bash
# Backend (in backend directory)
npm start

# Frontend (in frontend directory)
npm run dev
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
├── backend/                 # Node.js API Server
│   ├── services/
│   │   └── groqService.js  # AI model integration
│   ├── routes/
│   │   ├── suggestions.js  # Suggestions API
│   │   ├── chat.js         # Chat API
│   │   └── transcribe.js   # Transcription API
│   └── server.js           # Express server
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx         # Main component
│   │   │   ├── Settings.jsx    # Settings modal
│   │   │   ├── Suggestions.jsx # Suggestions panel
│   │   │   ├── Chat.jsx        # Chat interface
│   │   │   └── Transcript.jsx  # Transcript display
│   │   └── utils/
│   │       └── api.js          # API client
│   └── index.html
└── README.md
```

---

## 🤖 AI Models

| Model | Provider | Speed | Quality | Best For |
|-------|----------|-------|---------|----------|
| **GPT-OSS 120B** | Groq | Fast | Excellent | Complex reasoning |
| **LLaMA 3.3 70B** | Groq | Fast | Great | General tasks |
| **LLaMA 3.1 8B** | Groq | Very Fast | Good | Quick responses |
| **Mixtral 8x7B** | Groq | Fast | Great | Long conversations |

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

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy Backend**
```bash
cd backend
vercel --prod
```

3. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

4. **Set Environment Variables**
In Vercel Dashboard → Environment Variables:
```
GROQ_API_KEY=gsk_your_production_api_key
```

### Manual Deployment

#### Backend (Node.js)
```bash
cd backend
npm install --production
npm start
```

#### Frontend (Static Files)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to any static hosting service
```

---

## 🔧 API Endpoints

- `POST /api/transcribe` - Audio transcription
- `POST /api/suggestions` - Generate suggestions
- `POST /api/suggestions/expand` - Expand suggestion with details
- `POST /api/chat` - Chat with AI assistant

---

## 🔧 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your Groq API key starts with `gsk_` and is set in backend/.env
2. **Model Not Available**: Use correct model names like `openai/gpt-oss-120b`
3. **Audio Not Working**: Check browser microphone permissions
4. **Suggestions Not Generating**: Verify transcript length (minimum 30 characters)

### Getting Help
- Check browser console for error messages
- Verify API keys are correctly configured
- Ensure all dependencies are installed

---

## 📄 License

MIT License - see LICENSE file for details.

---

**⭐ If you find this project useful, please give it a star on GitHub!**

*Built with ❤️ for better meetings and smarter conversations*
