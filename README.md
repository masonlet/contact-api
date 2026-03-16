# Contact API
Deployable Resend contact form API

![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node.js-20+-green)

## Features
- Single `POST /api/contact` endpoint - drop into any project.
- CORS support via `ALLOWED_ORIGINS` env var.
- Input validation with descriptive error responses.
- Rate limiting via Vercel WAF to prevent spam and abuse.
- Honeypot protection

## Usage
```js
await fetch('https://your-deployment.vercel.app/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        subject: 'Hello',
        email: 'sender@example.com',
        message: 'Your message here'
    })
});
```

## Response
| Status | Body |
| ------ | ---- |
| 200    | { success: true, message: "Message sent successfully" } |
| 400    | { error: "Invalid or missing fields" } |
| 403    | { error: "Forbidden" } |
| 405    | { error: "Method not allowed" } |
| 415    | { error: "Unsupported Media Type" } |
| 429    | { error: "Too many requests. Please try again later." } |
| 500    | { error: "Message delivery failed. Please try again." } |
| 503    | { error: "Service temporarily unavailable" } |

## Deployment & Configuration

### Prerequisites
- Node.js 20+
- Resend API key
- Vercel

### 1. Clone the Repository
```bash
git clone https://github.com/masonlet/contact-api.git
cd contact-api
npm install
```

### 2. Configure Environment
Fill in `.env` using `.env.example`

#### Environment Variables
| Variable          | Description |
| ----------------- | ----------- |
| `RESEND_API_KEY`  | Your Resend API key |
| `FROM_EMAIL`      | Sender address (must be a verified Resend domain) |
| `TO_EMAIL`        | Where contact form submissions are delivered |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins, **Required** — empty blocks all requests. |

### 3. Deploy
```bash
vercel deploy
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
