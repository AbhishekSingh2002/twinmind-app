# TwinMind - AI Meeting Copilot

🧠 **An intelligent AI-powered meeting assistant that provides real-time transcription, smart suggestions, and context-aware chat capabilities during live conversations.**

![TwinMind Logo](https://img.shields.io/badge/TwinMind-AI%20Meeting%20Copilot-purple?style=for-the-badge&logo=brain)

---

## 🌟 Key Features

### 🎤 **Real-time Transcription**
- **Whisper Large V3** via Groq for ultra-fast, accurate speech-to-text
- **Live streaming** transcription with minimal latency
- **Automatic punctuation** and formatting
- **Multi-language support** (English optimized)

### 🔥 **Advanced AI Models**
- **GPT-OSS 120B** (OpenAI's flagship open-weight model via Groq)
- **LLaMA 3.3 70B Versatile** (Latest generation reasoning)
- **LLaMA 3.1 8B Instant** (Ultra-fast responses)
- **Mixtral 8x7B 32K** (Large context window)

### 🤖 **Intelligent Features**
- **Context-aware suggestions** based on meeting transcript
- **3 types of smart suggestions**: Questions, Insights, Clarifications
- **Detailed answer expansion** with TL;DR format
- **Chat integration** with full meeting context
- **Customizable prompts** for personalized behavior

### ⚙️ **Customization**
- **Editable prompts** for suggestions, detailed answers, and chat
- **Configurable context windows** (1000-15000 characters)
- **Model selection** with performance indicators
- **API key management** with local storage only

### 🎨 **Modern UI/UX**
- **Dark theme** optimized for long meetings
- **Responsive design** for all screen sizes
- **Smooth animations** and micro-interactions
- **Accessible design** with keyboard navigation
- **Single scrollbar** for clean interface

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Groq API key** (free tier available)
- **Modern browser** with microphone access

### 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbhishekSingh2002/twinmind-app.git
cd twinmind-app
```

2. **Install dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (new terminal)
cd frontend
npm install
```

3. **Set up environment variables**
```bash
# Create backend/.env file
cd backend
cp .env.example .env
```

Edit `backend/.env` with your API key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

4. **Start the application**
```bash
# Backend (in backend directory)
npm start
# → ✅ TwinMind server running on http://localhost:5000

# Frontend (in frontend directory, new terminal)
npm run dev
# → ✅ Vite server running on http://localhost:5173
```

5. **Open your browser**
Navigate to **http://localhost:5173** and add your Groq API key in Settings.

---

## 🔑 API Key Setup

### Getting Your Groq API Key

1. **Visit [Groq Console](https://console.groq.com)**
2. **Sign up** for a free account
3. **Navigate to API Keys** in the dashboard
4. **Create a new key** (starts with `gsk_`)
5. **Copy the key** and add it to Settings in the app

### Why Only Groq?

- **Unified API**: All models work through Groq's infrastructure
- **Consistent performance**: Same speed and reliability across models
- **Simple setup**: Only one API key to manage
- **Cost-effective**: Competitive pricing with generous free tier

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

### Project Structure
```
twinmind-app/
├── 📁 backend/                    # Node.js API Server
│   ├── 📁 services/
│   │   └── 📄 groqService.js     # AI model integration layer
│   ├── 📁 routes/
│   │   ├── 📄 suggestions.js     # Suggestions API endpoints
│   │   ├── 📄 chat.js            # Chat API endpoints
│   │   └── 📄 transcribe.js      # Transcription API
│   ├── 📄 server.js              # Express server setup
│   ├── 📄 package.json           # Backend dependencies
│   └── 📄 .env.example           # Environment template
├── 📁 frontend/                   # React Application
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📄 App.jsx         # Main application component
│   │   │   ├── 📄 Settings.jsx    # Settings modal
│   │   │   ├── 📄 Suggestions.jsx # Suggestions panel
│   │   │   ├── 📄 Chat.jsx        # Chat interface
│   │   │   ├── 📄 Transcript.jsx  # Transcript display
│   │   │   └── 📄 ErrorBoundary.jsx # Error handling
│   │   ├── 📁 utils/
│   │   │   └── 📄 api.js          # API client utilities
│   │   ├── 📄 main.jsx            # React entry point
│   │   └── 📄 demo.js             # Demo data
│   ├── 📄 index.html              # HTML template
│   ├── 📄 package.json           # Frontend dependencies
│   └── 📄 vite.config.js         # Vite configuration
├── 📄 vercel.json                # Vercel deployment config
├── 📄 .gitignore                 # Git ignore rules
└── 📄 README.md                  # This file
```

---

## 🔧 Technical Deep Dive

### Backend Architecture

#### **AI Service Layer (`groqService.js`)**
```javascript
// Core AI integration with multi-model support
async function callAI({ 
  messages, 
  model = "openai/gpt-oss-120b", 
  apiKey, 
  maxTokens = 1024, 
  temperature = 0.7 
}) {
  // Intelligent model routing
  const isOpenAI = model.startsWith('gpt-') && !model.includes('gpt-oss');
  const baseURL = isOpenAI ? OPENAI_BASE_URL : GROQ_BASE_URL;
  const key = apiKey || (isOpenAI ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY);
  
  // Unified API call with error handling
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });
}
```

#### **API Routes Structure**
- **`/api/transcribe`**: Audio → Text using Whisper Large V3
- **`/api/suggestions`**: Generate 3 context-aware suggestions
- **`/api/suggestions/expand`**: Detailed answer for selected suggestion
- **`/api/chat`**: Context-aware chat with meeting history

#### **Error Handling & Resilience**
- **Graceful degradation** when API keys are missing
- **Comprehensive error messages** for debugging
- **Null safety checks** throughout the codebase
- **Rate limiting awareness** for API calls

### Frontend Architecture

#### **Component Hierarchy**
```
App
├── Header (logo, actions, settings)
├── Banner (API key reminder)
├── Columns (main content area)
│   ├── Transcript (live transcription)
│   ├── Suggestions (AI suggestions panel)
│   └── Chat (context-aware chat)
└── Settings (modal overlay)
```

#### **State Management**
```javascript
// Centralized state in App.jsx
const [chunks, setChunks] = useState([]);                    // Transcript chunks
const [suggestions, setSuggestions] = useState([]);          // AI suggestions
const [chatHistory, setChatHistory] = useState([]);          // Chat messages
const [apiKey, setApiKey] = useState("");                    // API key
const [settings, setSettings] = useState(null);              // User settings
const [isLoadingSuggestions, setIsLoadingSugg] = useState(false); // Loading states
```

#### **Real-time Features**
- **Audio streaming** with Web Audio API
- **Debounced suggestions** (3-second delay)
- **Live transcript updates**
- **Automatic scroll management**

---

## 🎯 Feature Deep Dive

### 1. Smart Suggestions System

#### **Suggestion Types**
1. **🙋 Follow-up Questions**: Probing questions for speakers
2. **💡 Key Insights**: Important points and action items
3. **🔍 Clarifications**: Fact-checks and definitions

#### **Generation Process**
```javascript
// Context window management
const contextWindow = settings?.suggestionsContextWindow || 4000;
const chunk = transcript.slice(-contextWindow);

// AI-powered suggestion generation
const suggestions = await getSuggestions(chunk, apiKey, settings);
```

#### **Quality Controls**
- **Minimum transcript length**: 30 characters
- **Context window limits**: 1000-10000 characters
- **JSON parsing with fallbacks**
- **Error recovery mechanisms**

### 2. Transcription System

#### **Audio Pipeline**
```
Microphone → Web Audio API → Audio Buffer → Backend API → Whisper V3 → Text
```

#### **Features**
- **Real-time processing** with minimal latency
- **Automatic language detection**
- **Punctuation and formatting**
- **Timestamp preservation**

### 3. Chat Integration

#### **Context Awareness**
```javascript
// Chat includes full meeting context
const systemPrompt = `You are an AI assistant embedded inside a live meeting tool.
You have access to the current meeting transcript. Answer the user's questions clearly and concisely.

Current meeting transcript:
${transcript || "(No transcript yet — meeting may not have started)"}`;
```

#### **History Management**
- **Sliding window** of last 10 messages
- **Role-based conversation** (user/assistant)
- **Context preservation** across chat sessions

---

## ⚙️ Configuration Guide

### Model Comparison

| Model | Provider | Speed | Quality | Context | Best For |
|-------|----------|-------|---------|---------|----------|
| **GPT-OSS 120B** | Groq | Fast | Excellent | 131K | Complex reasoning |
| **LLaMA 3.3 70B** | Groq | Fast | Great | 128K | General tasks |
| **LLaMA 3.1 8B** | Groq | Very Fast | Good | 128K | Quick responses |
| **Mixtral 8x7B** | Groq | Fast | Great | 32K | Long conversations |

### Custom Prompts

#### **Suggestions Prompt Template**
```
You are an AI meeting copilot that helps users stay sharp during live conversations.

Based on the latest meeting transcript, generate EXACTLY 3 smart, context-aware suggestions.

Each suggestion must be a DIFFERENT type:
1. 🙋 A smart follow-up question to ask the speaker
2. 💡 A key insight, talking point, or action item to note
3. 🔍 A clarification, fact-check, or definition to verify
```

#### **Detailed Answers Format**
```
- Start with a one-line TL;DR summary
- Then give 3–5 bullet points of actionable detail
- End with a "Next Step" recommendation
Keep the total response under 200 words.
```

### Context Windows

- **Suggestions**: 4000 characters (default)
- **Detailed Answers**: 6000 characters (default)
- **Chat**: Full transcript with last 10 messages

---

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

#### 1. Backend Deployment
```bash
cd backend
vercel --prod
```

#### 2. Frontend Deployment
```bash
cd frontend
vercel --prod
```

#### 3. Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
```
GROQ_API_KEY=gsk_your_production_api_key
```

### Manual Deployment

#### Backend (Node.js)
```bash
cd backend
npm install --production
npm start
# Or use PM2 for production:
pm2 start server.js --name twinmind-backend
```

#### Frontend (Static Files)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to any static hosting service
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🔍 API Reference

### Endpoints

#### POST `/api/transcribe`
**Transcribe audio to text**
```json
{
  "audioBuffer": "base64_encoded_audio",
  "mimeType": "audio/webm",
  "apiKey": "gsk_..."
}
```

#### POST `/api/suggestions`
**Generate smart suggestions**
```json
{
  "transcript": "Meeting transcript text...",
  "apiKey": "gsk_...",
  "settings": {
    "model": "openai/gpt-oss-120b",
    "suggestionsContextWindow": 4000,
    "suggestionsPrompt": "Custom prompt..."
  }
}
```

#### POST `/api/suggestions/expand`
**Expand suggestion with details**
```json
{
  "transcript": "Full transcript...",
  "suggestion": {
    "id": "1",
    "type": "question",
    "icon": "🙋",
    "label": "Ask",
    "text": "What are the Q3 revenue numbers?"
  },
  "apiKey": "gsk_...",
  "settings": {...}
}
```

#### POST `/api/chat`
**Chat with AI assistant**
```json
{
  "transcript": "Meeting context...",
  "history": [
    {"role": "user", "content": "Question"},
    {"role": "assistant", "content": "Answer"}
  ],
  "question": "What should I ask next?",
  "apiKey": "gsk_...",
  "settings": {...}
}
```

### Response Format
```json
{
  "suggestions": [
    {
      "id": "1",
      "type": "question",
      "icon": "🙋",
      "label": "Ask",
      "text": "Follow-up question here..."
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🛠️ Development Guide

### Local Development Setup

1. **Fork and clone** the repository
2. **Create feature branch**: `git checkout -b feature-name`
3. **Install dependencies**: `npm install` in both directories
4. **Set up environment**: Copy `.env.example` to `.env`
5. **Start development servers**: `npm start` and `npm run dev`

### Code Style

#### JavaScript/JSX Standards
- **ES6+ features** (async/await, destructuring)
- **Functional components** with hooks
- **Arrow functions** for consistency
- **Descriptive variable names**

#### CSS-in-JS Pattern
```javascript
const styles = {
  component: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    background: "var(--surface)",
    borderRadius: "var(--radius)",
  },
};
```

### Testing

#### Manual Testing Checklist
- [ ] Audio recording and transcription
- [ ] Suggestion generation and expansion
- [ ] Chat functionality with context
- [ ] Settings persistence
- [ ] Error handling scenarios
- [ ] Responsive design
- [ ] Browser compatibility

#### Debug Tips
```javascript
// Enable debug logging
localStorage.setItem('twinmind-debug', 'true');

// Check API responses in Network tab
// Look for: /api/suggestions, /api/chat, /api/transcribe
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **API Key Errors**
**Problem**: "API key is missing" or "Invalid API key"
**Solution**: 
- Verify key in `backend/.env` starts with `gsk_`
- Check for extra spaces or special characters
- Ensure backend server is restarted after changes

#### 2. **Model Not Available**
**Problem**: "Model does not exist or you do not have access to it"
**Solution**:
- Use correct model names: `openai/gpt-oss-120b`
- Check Groq model availability
- Verify API key permissions

#### 3. **Audio Not Working**
**Problem**: No transcription or microphone errors
**Solution**:
- Check browser microphone permissions
- Ensure HTTPS in production
- Test with different browsers
- Check console for Web Audio API errors

#### 4. **Suggestions Not Generating**
**Problem**: No suggestions appear
**Solution**:
- Check transcript length (minimum 30 characters)
- Verify API key is set in frontend Settings
- Check Network tab for API errors
- Ensure context window is appropriate

#### 5. **Double Scrollbars**
**Problem**: Two scrollbars appear
**Solution**:
- Check CSS overflow settings
- Ensure `overflow: hidden` on global container
- Verify `overflow: auto` on content container

### Performance Optimization

#### Frontend
- **Debounced API calls** for suggestions
- **Lazy loading** for large transcripts
- **Optimized re-renders** with React.memo
- **Efficient state management**

#### Backend
- **Connection pooling** for API calls
- **Request caching** where appropriate
- **Error rate limiting**
- **Graceful degradation**

---

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- **Follow existing code style**
- **Add tests for new features**
- **Update documentation**
- **Ensure all tests pass**
- **Check accessibility**

### Feature Ideas

- [ ] **Meeting recording** and playback
- [ ] **Multi-language support** for transcription
- [ ] **Meeting templates** for different scenarios
- [ ] **Integration with calendars** (Google Calendar, Outlook)
- [ ] **Team collaboration** features
- [ ] **Analytics dashboard** for meeting insights
- [ ] **Mobile app** (React Native)
- [ ] **Desktop app** (Electron)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for ultra-fast AI inference
- **OpenAI** for GPT-OSS 120B model
- **Vercel** for hosting platform
- **React** for frontend framework
- **Express.js** for backend framework
- **Vite** for build tooling

---

## 📞 Support

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and code comments
- **Community**: Join discussions in GitHub Discussions

### Contact

- **Maintainer**: Abhishek Singh
- **Email**: [your-email@example.com]
- **Twitter**: [@your-twitter]

---

**⭐ If you find this project useful, please give it a star on GitHub!**

---

*Built with ❤️ for better meetings and smarter conversations*
