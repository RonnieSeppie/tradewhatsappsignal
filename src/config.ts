import "dotenv/config";

const captureOnly = process.env.CAPTURE_ONLY !== "false";
if (!captureOnly) throw new Error("Milestone 1 requires CAPTURE_ONLY=true");

export const config = {
  captureOnly,
  databasePath: process.env.DATABASE_PATH ?? "./data/signals.db",
  allowedChatName: process.env.WHATSAPP_ALLOWED_CHAT_NAME?.trim() || undefined,
  allowedChatId: process.env.WHATSAPP_ALLOWED_CHAT_ID?.trim() || undefined,
};

if (!config.allowedChatName && !config.allowedChatId) {
  console.warn("No WhatsApp allowlist configured; all inbound chats will be rejected.");
}
