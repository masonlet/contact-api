# Contact API
Deployable **multi-provider** contact form API

[![Tests](https://github.com/masonlet/contact-api/actions/workflows/ci.yml/badge.svg)](https://github.com/masonlet/contact-api/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node.js-20+-green)

## Table of Contents
- [Features](#features)
- [Usage](#usage)
- [Response](#response)
- [Deployment & Configuration](#deployment--configuration)
  - [Prerequisites](#prerequisites)
  - [Configure `.env`](#2-configure-env)
  - [Deploying](#deploying)
  - [Local Development](#local-development)
- [License](#license)

## Features
- Single `POST /api/contact` endpoint - drop into any project.
- Multi-provider support: Resend, Nodemailer (SMTP).
- CORS support via `ALLOWED_ORIGINS` env var.
- Input validation with descriptive error responses.
- Rate limiting via Vercel WAF to prevent spam and abuse.
- Honeypot protection
> **Note:** To utilize the honeypot, ensure your frontend includes a hidden input field named `[fax_number]` that remains empty during submission.

## Usage
```js
await fetch("https://your-deployment.vercel.app/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email: "sender@example.com",  // required
        message: "Your message here", // required
        subject: "Hello",             // optional
        name: "Your name",            // optional
        fax_number: ""                // optional; must be empty
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
- Vercel
- An email provider
    - **Resend:** API key and verified domain
    - **Nodemailer:** Valid SMTP settings (host, port, user, pass).

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
| `FROM_EMAIL`      | Sender address |
| `TO_EMAIL`        | Recipients (comma-separated) |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated); empty blocks all requests. |
| `EMAIL_PROVIDER`  | `resend` or `nodemailer`. |
| `RESEND_API_KEY`  | Your Resend API key (using `resend` provider) |
| `SMTP_CONFIG`     | JSON string of Nodemailer config (using `nodemailer` provider) |

### Deploying

#### Deploy with Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/masonlet/contact-api&env=FROM_EMAIL,TO_EMAIL,ALLOWED_ORIGINS,EMAIL_PROVIDER,RESEND_API_KEY&envDescription[FROM_EMAIL]=Sender%20address%20(must%20be%20a%20verified%20Resend%20domain)&envDescription[TO_EMAIL]=Delivery%20address&envDescription[ALLOWED_ORIGINS]=Comma-separated%20list%20of%20allowed%20CORS%20origins&envDescription[EMAIL_PROVIDER]=resend&envDescription[RESEND_API_KEY]=Your%20Resend%20API%20key)

#### Deploy with Nodemailer
[![Deploy with Nodemailer](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/masonlet/contact-api&env=FROM_EMAIL,TO_EMAIL,ALLOWED_ORIGINS,EMAIL_PROVIDER,SMTP_CONFIG&envDescription[FROM_EMAIL]=Sender%20address%20(must%20be%20a%20verified%20Resend%20domain)&envDescription[TO_EMAIL]=Delivery%20address&envDescription[ALLOWED_ORIGINS]=Comma-separated%20list%20of%20allowed%20CORS%20origins&envDescription[EMAIL_PROVIDER]=nodemailer&envDescription[SMTP_CONFIG]=JSON%20string%20of%20SMTP%20settings)

### Local Development
```bash
npm run typecheck     # TypeScript type check
npm run test          # Vitest check
npm run test:watch    # Vitest watch mode
npm run test:coverage # Vitest coverage mode
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
