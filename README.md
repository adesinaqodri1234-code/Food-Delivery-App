# Food Delivery App

A minimal static demo of a food ordering landing experience.

## AI Assistant (chat)

This project includes a simple AI assistant prototype. To run it locally:

1. Install server dependencies:

```bash
cd server
npm install
```

2. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.

3. Start the proxy server:

```bash
npm start
```

Open the site in a browser and click the assistant button at the bottom-right to ask questions.

Note: The server is a minimal proxy for development. Review security and rate-limiting before deploying.
