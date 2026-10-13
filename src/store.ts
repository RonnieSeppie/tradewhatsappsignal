import Database from "better-sqlite3";
import type { ParseResult } from "./parser.js";

export type CapturedMessage = {
  id: string;
  chatId: string;
  chatName: string;
  senderId: string;
  body: string;
  timestamp: number;
  fingerprint: string;
  parseResult: ParseResult;
};

export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS captured_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      chat_name TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      fingerprint TEXT NOT NULL UNIQUE,
      parse_status TEXT NOT NULL,
      parse_result_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

export function insertMessage(db: Database.Database, message: CapturedMessage): boolean {
  const result = db.prepare(`
    INSERT OR IGNORE INTO captured_messages
      (id, chat_id, chat_name, sender_id, body, timestamp, fingerprint, parse_status, parse_result_json)
    VALUES (@id, @chatId, @chatName, @senderId, @body, @timestamp, @fingerprint, @parseStatus, @parseResultJson)
  `).run({
    ...message,
    parseStatus: message.parseResult.status,
    parseResultJson: JSON.stringify(message.parseResult),
  });
  return result.changes === 1;
}
