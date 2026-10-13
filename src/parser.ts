import { z } from "zod";

export const SignalSchema = z.object({
  direction: z.enum(["BUY", "SELL"]),
  symbol: z.string().min(1).max(32),
  entry: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfits: z.array(z.number().positive()).max(5).default([]),
  timeframe: z.string().max(16).optional(),
  confidence: z.number().min(0).max(1),
});

export type Signal = z.infer<typeof SignalSchema>;

export type ParseResult =
  | { status: "accepted"; signal: Signal; reasons: string[] }
  | { status: "rejected"; signal: null; reasons: string[] };

const SYMBOLS = new Set([
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
  "XAUUSD", "XAGUSD", "BTCUSD", "ETHUSD",
]);

function numberAfter(text: string, labels: string[]): number | undefined {
  const label = labels.join("|");
  const match = text.match(new RegExp(`(?:${label})\\s*[:=@-]?\\s*(\\d+(?:\\.\\d+)?)`, "i"));
  return match ? Number(match[1]) : undefined;
}

export function parseSignal(raw: string): ParseResult {
  const text = raw.replace(/[,|]/g, " ").replace(/\s+/g, " ").trim();
  const upper = text.toUpperCase();
  const direction = /\b(BUY|LONG)\b/.test(upper) ? "BUY" : /\b(SELL|SHORT)\b/.test(upper) ? "SELL" : undefined;
  const symbol = [...SYMBOLS].find((candidate) => upper.includes(candidate));
  const entry = numberAfter(text, ["ENTRY", "ENT", "@"]);
  const stopLoss = numberAfter(text, ["SL", "STOP\\s*LOSS"]);
  const takeProfits = [...text.matchAll(/(?:TP|TAKE\\s*PROFIT)\\s*[:=@-]?\\s*(\\d+(?:\\.\\d+)?)/gi)].map((m) => Number(m[1]));
  const timeframe = text.match(/\b(M\d+|H\d+|D1|W1)\b/i)?.[1]?.toUpperCase();
  const reasons: string[] = [];

  if (!direction) reasons.push("missing direction");
  if (!symbol) reasons.push("unsupported or missing symbol");
  if (stopLoss === undefined) reasons.push("missing stop loss");

  if (reasons.length > 0) return { status: "rejected", signal: null, reasons };

  const signal = SignalSchema.parse({
    direction,
    symbol,
    entry,
    stopLoss,
    takeProfits,
    timeframe,
    confidence: entry === undefined ? 0.65 : 0.85,
  });
  return { status: "accepted", signal, reasons: [] };
}
