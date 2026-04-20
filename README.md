# TwinMind App

An AI-powered meeting assistant that provides real-time suggestions, detailed answers, and chat capabilities during live conversations.

## Features

- 🎤 **Real-time Transcription**: Using Whisper Large V3 for accurate speech-to-text
- 🔥 **GPT-OSS 120B**: Advanced AI model for intelligent suggestions and responses
- 🤖 **Multiple AI Models**: Support for GPT-4, GPT-4 Turbo, LLaMA, Mixtral, and Gemma
- 📝 **Customizable Prompts**: Editable prompts for suggestions, detailed answers, and chat
- 🪟 **Configurable Context**: Adjustable context windows for different use cases
- 🔄 **Manual Refresh**: Instant suggestion refresh on demand
- 💬 **Smart Chat**: Context-aware chat with meeting transcript integration

## Quick Start

### Prerequisites

- Node.js 18+ installed
- API keys for AI models (see below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AbhishekSingh2002/twinmind-app.git
cd twinmind-app
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

3. Set up environment variables:
```bash
# In backend/.env
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENAI_API_KEY=sk_your_openai_api_key_here
OPENROUTER_API_KEY=sk-or-your_openrouter_api_key_here
```

4. Start the application:
```bash
# Backend (in backend directory)
npm start

# Frontend (in frontend directory)
npm run dev
```

5. Open http://localhost:5173 and add your API key in Settings

## API Keys Setup

### For GPT-OSS 120B (Required)
1. Go to [OpenRouter](https://openrouter.ai/settings/keys)
2. Create an API key
3. Add it to your backend/.env as `OPENROUTER_API_KEY`

### For OpenAI Models
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your backend/.env as `OPENAI_API_KEY`

### For Groq Models
1. Go to [Groq Console](https://console.groq.com)
2. Create an API key
3. Add it to your backend/.env as `GROQ_API_KEY`

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy Backend**:
```bash
cd backend
vercel --prod
```

3. **Deploy Frontend**:
```bash
cd frontend
vercel --prod
```

4. **Set Environment Variables in Vercel**:
- Go to your Vercel dashboard
- Navigate to Project Settings → Environment Variables
- Add your API keys:
  - `GROQ_API_KEY`
  - `OPENAI_API_KEY`
  - `OPENROUTER_API_KEY`

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
# Deploy the 'dist' folder to your hosting service
```

## Configuration

### Model Selection
- **GPT-OSS 120B**: Recommended for high-reasoning tasks
- **GPT-4 Turbo**: Fast and capable for general use
- **GPT-4**: Advanced reasoning capabilities
- **LLaMA Models**: Open-source alternatives via Groq
- **Mixtral**: Large context window (32K tokens)
- **Gemma**: Lightweight and fast

### Custom Prompts
In Settings, you can customize:
- **Suggestions Prompt**: How suggestions are generated
- **Detailed Answers Prompt**: Format for expanded answers
- **Chat Prompt**: System prompt for chat interactions

### Context Windows
- **Suggestions Context**: Characters considered for live suggestions (default: 4000)
- **Detailed Answers Context**: Characters for expanded answers (default: 6000)

## Architecture

```
twinmind-app/
├── backend/                 # Node.js API server
│   ├── services/
│   │   └── groqService.js  # AI model integration
│   ├── routes/
│   │   ├── suggestions.js  # Suggestions API
│   │   ├── chat.js         # Chat API
│   │   └── transcribe.js   # Transcription API
│   └── server.js           # Express server
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Settings.jsx    # Settings modal
│   │   │   ├── Suggestions.jsx # Suggestions panel
│   │   │   ├── Chat.jsx        # Chat interface
│   │   │   └── Transcript.jsx  # Transcript display
│   │   └── utils/
│   │       └── api.js          # API client
│   └── index.html
├── vercel.json            # Vercel configuration
└── README.md
```

## API Endpoints

- `POST /api/transcribe` - Audio transcription
- `POST /api/suggestions` - Generate suggestions
- `POST /api/suggestions/expand` - Expand suggestion with details
- `POST /api/chat` - Chat with AI assistant

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLaMA models | Optional |
| `OPENAI_API_KEY` | OpenAI API key for GPT models | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key for GPT-OSS 120B | Required |

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correctly set in backend/.env
2. **Model Not Available**: Check if you have the correct API key for the selected model
3. **CORS Issues**: Make sure your frontend URL is allowed in production
4. **Audio Not Working**: Check microphone permissions and browser compatibility

### Getting Help

- Check the browser console for error messages
- Verify API keys are correctly configured
- Ensure all dependencies are installed
- Check network connectivity

## License

MIT License - see LICENSE file for details
