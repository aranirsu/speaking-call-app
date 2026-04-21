# SpeakFlow - English Speaking Practice App

## Overview
A modern English speaking practice application with real-time partner matching, WebRTC audio calls, AI-powered chat, and voice recording with AI feedback.

## Features

### Core Features
- **Partner Matching**: Real-time partner discovery and connection
- **WebRTC Audio Calls**: Crystal-clear peer-to-peer audio conversations
- **AI Chat Practice**: Text-based conversation practice with AI
- **Voice Practice**: Record your speech and get AI-powered feedback on:
  - Fluency and naturalness
  - Grammar accuracy
  - Vocabulary usage
  - Pronunciation clarity

### UI/UX
- **Modern Minimal Design**: Clean, professional light theme
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Transcription**: See your words as you speak
- **Detailed Feedback**: Structured analysis with scores and suggestions

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Socket.io (for real-time messaging)
- **AI**: Vercel AI SDK 6 with OpenAI integration
- **Speech**: Web Speech API for transcription
- **WebRTC**: Peer-to-peer audio connections

## Getting Started

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build & Deploy
```bash
npm run build
npm start
```

## Deployment

This project is configured for Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js configuration
3. Deploy with a single push to your main branch

See [vercel.json](./vercel.json) for build configuration.

## File Structure

```
/app                 - Next.js app router pages
  /api              - API routes (speech analysis)
  /practice         - Voice practice page
  /ai-chat          - AI chat practice page
  /match            - Partner matching
  /call             - Audio call interface

/components         - Reusable React components
/hooks              - Custom React hooks
/context            - React context providers
/lib                - Utility functions
/types              - TypeScript type definitions
/public             - Static assets
```

## Environment Variables

For production deployment, ensure these are set:
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket server URL
- `AI_GATEWAY_API_KEY` - For AI features (optional if using Vercel AI Gateway)

## License
MIT
