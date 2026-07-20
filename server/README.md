# FreshBite AI Proxy

This small Node.js Express server proxies chat requests to the OpenAI API. It's intended for local development only — keep your API key secret.

Setup

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
2. From the `server` folder install dependencies:

```bash
cd server
npm install
```

Run

```bash
# start server
npm start

# or for development with nodemon
npm run dev
```

The server serves the frontend statically and listens on `PORT` (default `5174`). The frontend will POST to `/api/ai` with `{ message }` and receive `{ reply }`.

Security

- Never commit your `.env` with secrets.
- For production, implement rate limits, authentication, and input sanitization.
