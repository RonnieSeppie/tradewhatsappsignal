# Milestone 1 MT5 read-only seam

Milestone 1 does not execute trades. This document defines the interface the later MT5 bridge must satisfy before any execution milestone is considered.

## Required read-only capabilities

| Capability | Purpose |
|---|---|
| Account snapshot | Balance, equity, margin level |
| Symbol metadata | Tick size, lot step, margin requirements |
| Live tick | Bid/ask freshness check |
| Open positions | Exposure reconciliation |
| Terminal health | Connected broker, auto-trading enabled, heartbeat |

## Later execution constraints (not implemented)

- Mandatory stop-loss on every order
- Idempotent order submission keyed by signal ID
- Daily loss and exposure limits
- Kill switch and close-only mode
- Position reconciliation after every action
- Full audit trail of approvals and orders

## Candidate reference

The `huy-bui-tech/mt5_api` repository demonstrates the Python-server-plus-MQL5-EA socket pattern. Adopt the architecture, not blind reuse; add authentication, idempotency, and reconciliation before any live order path exists.
