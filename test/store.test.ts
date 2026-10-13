import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { openDatabase, insertMessage } from "../src/store.js";
import { parseSignal } from "../src/parser.js";

function makeStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "twm-"));
  return { dir, db: openDatabase(path.join(dir, "test.db")) };
}

test("inserts a message and rejects duplicates by fingerprint", () => {
  const { db } = makeStore();
  const parseResult = parseSignal("BUY XAUUSD Entry 2400 SL 2395");
  const message = {
    id: "m1",
    chatId: "123@g.us",
    chatName: "Signals",
    senderId: "author@s.whatsapp.net",
    body: "BUY XAUUSD Entry 2400 SL 2395",
    timestamp: 1760000000,
    fingerprint: "fp-1",
    parseResult,
  };
  assert.equal(insertMessage(db, message), true);
  assert.equal(insertMessage(db, message), false);
});

test("stores rejected parses for audit", () => {
  const { db } = makeStore();
  const parseResult = parseSignal("hello team");
  const inserted = insertMessage(db, {
    id: "m2",
    chatId: "123@g.us",
    chatName: "Signals",
    senderId: "author@s.whatsapp.net",
    body: "hello team",
    timestamp: 1760000001,
    fingerprint: "fp-2",
    parseResult,
  });
  assert.equal(inserted, true);
  const row = db.prepare("SELECT parse_status FROM captured_messages WHERE id = 'm2'").get();
  assert.equal(row.parse_status, "rejected");
});
