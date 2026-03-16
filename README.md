# Contact API
Deployable Resend contact form API

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/masonlet/contact-api&env=RESEND_API_KEY,FROM_EMAIL,TO_EMAIL,ALLOWED_ORIGINS&envDescription[RESEND_API_KEY]=Your%20Resend%20API%20key&envDescription[FROM_EMAIL]=Sender%20address%20(must%20be%20a%20verified%20Resend%20domain)&envDescription[TO_EMAIL]=Delivery%20address&envDescription[ALLOWED_ORIGINS]=Comma-separated%20list%20of%20allowed%20CORS%20origins)
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
- Resend API key & verified domain
- Vercel

### 1. Clone & Install
```bash
git clone https://github.com/masonlet/contact-api.git
cd contact-api
npm install
```

### 2. Configure `.env`
Copy `.env.example` to `.env` and fill Environment Variables. All values are **required**.

| Variable          | Description |
| ----------------- | ----------- |
| `RESEND_API_KEY`  | Your Resend API key |
| `FROM_EMAIL`      | Sender address (must be a verified Resend domain) |
| `TO_EMAIL`        | Delivery address |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins, empty blocks all requests. |

### Deploy
```bash
vercel deploy
```

### Local Development
```bash
npm run typecheck     # TypeScript type check
npm run test          # Vitest check
npm run test:watch    # Vitest watch mode
npm run test:coverage # Vitest coverage mode
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
