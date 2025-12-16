# SpeakFlow - Voice Practice App

Real-time voice calling app for language practice.

## Structure

```
├── frontend/    → Next.js app (Deploy on Netlify/Vercel)
├── backend/     → Socket.io server (Deploy on Railway/Render)
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend → Railway
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Set root directory: `backend`
4. Auto deploys!

### Frontend → Netlify
1. Go to [netlify.com](https://netlify.com)
2. Add new site → Import from Git
3. Set root directory: `frontend`
4. Add env variable: `NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app`
5. Deploy!
