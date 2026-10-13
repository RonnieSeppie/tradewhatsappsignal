# Local verification checklist

Run through this checklist before VPS deployment. Record the result of each step.

| # | Check | Command / action | Expected |
|---|---|---|---|
| 1 | Install | `npm install` | Completes without errors |
| 2 | Tests | `npm run test` | All parser and store tests pass |
| 3 | Type check | `npm run build` | Compiles cleanly |
| 4 | Configuration | Copy `.env.example` to `.env`, set `WHATSAPP_ALLOWED_CHAT_NAME` | Listener warns if allowlist missing |
| 5 | Capture-only guard | Temporarily set `CAPTURE_ONLY=false` | Application refuses to start |
| 6 | QR pairing | `npm run dev`, scan QR with dedicated account | Console shows ready message |
| 7 | Allowlist rejection | Send a message from a non-allowlisted chat | No database row created |
| 8 | Capture and deduplication | Send the same test signal twice | Second insert is ignored |
| 9 | Parser audit | Send `BUY XAUUSD Entry 2400 SL 2395` | Row stored with `parse_status=accepted` |
| 10 | Rejection audit | Send a plain chat message | Row stored with `parse_status=rejected` |
| 11 | No outbound messages | Inspect network/log activity | Nothing is sent to WhatsApp |
| 12 | Graceful shutdown | Ctrl+C the listener | Process exits without data loss |

Do not proceed to VPS deployment until all twelve checks pass on the local machine.
