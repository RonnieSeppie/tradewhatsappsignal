import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSignal } from "../src/parser.js";

test("accepts a complete buy signal", () => {
  const result = parseSignal("BUY XAUUSD Entry 2400 SL 2395 TP 2410 TP 2420 H1");
  assert.equal(result.status, "accepted");
  if (result.status === "accepted") {
    assert.equal(result.signal.direction, "BUY");
    assert.equal(result.signal.symbol, "XAUUSD");
    assert.equal(result.signal.stopLoss, 2395);
    assert.deepEqual(result.signal.takeProfits, [2410, 2420]);
    assert.equal(result.signal.timeframe, "H1");
  }
});

test("accepts a sell signal with comma separators", () => {
  const result = parseSignal("SELL EURUSD, entry 1.0850, SL 1.0880, TP 1.0800");
  assert.equal(result.status, "accepted");
  if (result.status === "accepted") {
    assert.equal(result.signal.direction, "SELL");
    assert.equal(result.signal.symbol, "EURUSD");
    assert.equal(result.signal.stopLoss, 1.088);
    assert.deepEqual(result.signal.takeProfits, [1.08]);
  }
});

test("rejects missing stop loss", () => {
  const result = parseSignal("BUY GBPUSD entry 1.2650 TP 1.2700");
  assert.equal(result.status, "rejected");
  assert.ok(result.reasons.includes("missing stop loss"));
});

test("rejects unsupported symbol", () => {
  const result = parseSignal("BUY AAPL entry 180 SL 178");
  assert.equal(result.status, "rejected");
  assert.ok(result.reasons.includes("unsupported or missing symbol"));
});

test("rejects missing direction", () => {
  const result = parseSignal("XAUUSD entry 2400 SL 2395");
  assert.equal(result.status, "rejected");
  assert.ok(result.reasons.includes("missing direction"));
});

test("rejects noise messages", () => {
  const result = parseSignal("Good morning everyone, nice win yesterday!");
  assert.equal(result.status, "rejected");
});
