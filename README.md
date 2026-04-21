# SpeakFlow - English Speaking Practice App

A modern English speaking practice application with real-time partner matching, WebRTC audio calls, AI-powered chat, and voice recording with AI feedback.

## Project Structure

```
├── frontend/    → Next.js app (deployed on Vercel/Netlify)
└── backend/     → Socket.io signaling server (deployed on Railway/Render)
```

## Features

- **Partner Matching**: Real-time anonymous partner discovery
- **WebRTC Audio Calls**: Peer-to-peer voice conversations
- **AI Chat Practice**: Text-based conversation with AI
- **Voice Practice**: Record speech and get AI feedback on fluency, grammar, vocabulary, and pronunciation
- **Modern Minimal UI**: Clean light theme with professional design

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Vercel AI SDK 6
- **Backend**: Node.js, Express, Socket.io
- **Speech**: Web Speech API for transcription
- **WebRTC**: Peer-to-peer audio

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Backend
```bash
cd backend
npm install
npm start
```
Socket server runs on port 3001

## Deployment

### Frontend → Vercel (Recommended)
- The Vercel project must have **Root Directory** set to `frontend`
- Vercel will auto-detect Next.js and build correctly
- Environment variables needed:
  - `NEXT_PUBLIC_SOCKET_URL` — URL of your deployed backend

### Backend → Railway / Render
- Point the deploy to the `backend` folder
- Start command: `npm start`
- No env variables required for basic operation

## License
MIT
