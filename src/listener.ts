import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { config } from "./config.js";
import { parseSignal } from "./parser.js";
import { insertMessage, openDatabase } from "./store.js";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
const db = openDatabase(config.databasePath);
const client = new Client({ authStrategy: new LocalAuth({ clientId: "capture-only" }) });

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("WhatsApp listener ready; capture-only mode enabled."));
client.on("auth_failure", (message) => console.error("WhatsApp authentication failure:", message));
client.on("disconnected", (reason) => console.error("WhatsApp listener disconnected:", reason));

client.on("message", async (message) => {
  const chat = await message.getChat();
  const allowed = (config.allowedChatId && chat.id._serialized === config.allowedChatId)
    || (config.allowedChatName && chat.name === config.allowedChatName);
  if (!allowed) return;

  const body = message.body.trim();
  if (!body) return;
  const fingerprint = crypto.createHash("sha256").update(`${chat.id._serialized}|${message.from}|${message.timestamp}|${body}`).digest("hex");
  const parseResult = parseSignal(body);
  const inserted = insertMessage(db, {
    id: message.id.id,
    chatId: chat.id._serialized,
    chatName: chat.name,
    senderId: message.author ?? message.from,
    body,
    timestamp: message.timestamp,
    fingerprint,
    parseResult,
  });
  if (inserted) console.log(JSON.stringify({ event: "captured", messageId: message.id.id, chat: chat.name, parseStatus: parseResult.status }));
});

process.once("SIGINT", async () => { db.close(); await client.destroy(); process.exit(0); });
process.once("SIGTERM", async () => { db.close(); await client.destroy(); process.exit(0); });

client.initialize();
