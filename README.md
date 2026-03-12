# Contact API
Deployable Resend contact form API

![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18+-green)

## Features
- Single `POST /api/contact` endpoint - drop into any project.
- CORS support via `ALLOWED_ORIGINS` env var.
- Input validation with descriptive error responses.

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
| 400    | { error: "All fields are required" } |
| 405    | { error: "Method not allowed" } |
| 500    | { error: "Failed to send message" } |

## Deployment & Configuration

### Prerequisites
- Node.js 18+
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
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

### 3. Deploy
```bash
vercel deploy
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
