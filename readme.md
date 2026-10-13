# Trade WhatsApp Signal — Milestone 1

Capture-only WhatsApp signal intake with a local audit store and read-only MT5 health seam.

## Safety boundary

Milestone 1 **does not place MT5 orders and does not send WhatsApp messages**. It only captures messages from one allowlisted chat, fingerprints and parses candidate signals, and records decisions for review.

The WhatsApp adapter uses an unofficial WhatsApp Web client. Use a dedicated account and review WhatsApp policies before deployment. Never commit session data, broker credentials, API keys, or `.env` files.

## Components

- Node.js/TypeScript listener using `whatsapp-web.js`
- SQLite event store
- Deterministic signal parser with replay tests
- Read-only MT5 bridge placeholder and health contract
- Dashboard/API integration seam to be added after capture replay passes

## Local setup

```bash
npm install
cp .env.example .env
npm run test
npm run dev
```

On first run, scan the QR code with the dedicated WhatsApp account. Set `WHATSAPP_ALLOWED_CHAT_NAME` or `WHATSAPP_ALLOWED_CHAT_ID` before accepting messages.

## Required environment

See `.env.example`. The default mode is deliberately `CAPTURE_ONLY=true`. The application refuses to start if capture-only mode is disabled in Milestone 1.

## Suggested rollout

1. Run locally with a test group and replay fixtures.
2. Verify allowlisting, deduplication, parser rejection, and audit records.
3. Deploy to the Windows VPS behind a private network.
4. Add the dashboard and read-only MT5 health adapter.
5. Keep execution disabled until a later, separately approved milestone.

## License

Private project code in a public repository: do not add secrets or personal message exports.
