#!/usr/bin/env node

import Lark from "@larksuiteoapi/node-sdk";

const appId = "cli_a909aebd96b89cc2";
const appSecret = "UkOnnSDmh53tJyiGU8N3HhN1DZi4PKwM";

console.log("🔍 Testing Feishu WebSocket connection...");
console.log(`📱 App ID: ${appId}`);
console.log("");

const wsClient = new Lark.WSClient({
  appId,
  appSecret,
  domain: "feishu",
  loggerLevel: Lark.LoggerLevel.info,
  logger: {
    debug: (msg) => console.log("[DEBUG]", msg),
    info: (msg) => console.log("[INFO]", msg),
    warn: (msg) => console.warn("[WARN]", msg),
    error: (msg) => console.error("[ERROR]", msg),
    trace: (msg) => console.log("[TRACE]", msg),
  },
});

const eventDispatcher = new Lark.EventDispatcher({}).register({
  "im.message.receive_v1": async (data) => {
    console.log("📨 Received message event:", data);
  },
});

console.log("🚀 Starting WebSocket client...");
console.log("");

let connectionEstablished = false;

wsClient
  .start({ eventDispatcher })
  .then(() => {
    connectionEstablished = true;
    console.log("");
    console.log("✅ WebSocket connection established successfully!");
    console.log("");
    console.log("🎉 The connection is now active.");
    console.log("📋 You can now configure event subscription in Feishu Open Platform:");
    console.log("   1. Go to your app → Event Subscription");
    console.log('   2. Select "Use long connection to receive events"');
    console.log("   3. Add event: im.message.receive_v1");
    console.log("   4. Click Save");
    console.log("");
    console.log("Press Ctrl+C to stop.");
    console.log("");
  })
  .catch((err) => {
    console.error("");
    console.error("❌ WebSocket connection failed!");
    console.error("");
    console.error("Error details:", err);
    console.error("");
    console.error("Possible causes:");
    console.error("  - Network firewall blocking WebSocket connections");
    console.error("  - Invalid App ID or App Secret");
    console.error("  - Feishu API service issues");
    console.error("  - Proxy configuration needed");
    console.error("");
    process.exit(1);
  });

// Check if connection is established within 10 seconds
setTimeout(() => {
  if (!connectionEstablished) {
    console.log("");
    console.log("⏳ Still waiting for WebSocket connection...");
    console.log("   This is taking longer than expected.");
    console.log("");
  }
}, 10000);

// Keep process alive
process.on("SIGINT", () => {
  console.log("");
  console.log("🛑 Stopping...");
  process.exit(0);
});
