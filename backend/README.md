# SpeakFlow Backend

Socket.io server for real-time voice calling and WebRTC signaling.

## Setup

```bash
npm install
```

## Run Locally

```bash
npm start
```

Server will run on `http://localhost:3001`

## Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select this `backend` folder
4. Railway will auto-detect Node.js and deploy

## Deploy on Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `npm start`

## Environment Variables

- `PORT` - Server port (default: 3001)

## API Endpoints

- `GET /` - Server status & stats
- `GET /health` - Health check

## Socket Events

### Client → Server
- `find-match` - Start looking for a partner
- `cancel-match` - Cancel matching
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `chat-message` - Send chat message
- `end-call` - End current call

### Server → Client
- `waiting` - Added to waiting list
- `matched` - Partner found
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `chat-message` - Receive chat message
- `call-ended` - Call was ended
