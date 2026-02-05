#!/usr/bin/env node

import Lark from "@larksuiteoapi/node-sdk";

const appId = "cli_a909aebd96b89cc2";
const appSecret = "UkOnnSDmh53tJyiGU8N3HhN1DZi4PKwM";

console.log("🔍 Testing Feishu WebSocket connection with detailed debugging...");
console.log(`📱 App ID: ${appId}`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);
console.log("");

// Track connection state
let connectionState = "initializing";
let hasReceivedData = false;

const wsClient = new Lark.WSClient({
  appId,
  appSecret,
  domain: Lark.Domain.Feishu,
  loggerLevel: Lark.LoggerLevel.debug, // Use debug level for more details
  logger: {
    debug: (msg) => {
      console.log(`[DEBUG ${new Date().toISOString()}]`, msg);

      // Track connection state changes
      if (msg && typeof msg === "object" && msg.length > 0) {
        const str = JSON.stringify(msg);
        if (str.includes("ws client ready")) {
          connectionState = "ready";
          console.log("");
          console.log("🎉 ======= WebSocket client is READY! =======");
          console.log("");
        } else if (str.includes("connect success")) {
          connectionState = "connected";
          console.log("");
          console.log("✅ ======= WebSocket CONNECTED! =======");
          console.log("");
        } else if (str.includes("unable to connect")) {
          connectionState = "failed";
          console.log("");
          console.log("❌ ======= Connection FAILED! =======");
          console.log("");
        }
      }
    },
    info: (msg) => {
      console.log(`[INFO ${new Date().toISOString()}]`, msg);

      // Check for event-dispatch ready
      if (msg && typeof msg === "object" && msg.length > 0) {
        const str = JSON.stringify(msg);
        if (str.includes("event-dispatch is ready")) {
          console.log("");
          console.log("📋 Event dispatcher is ready");
          console.log("");
        }
      }
    },
    warn: (msg) => {
      console.warn(`[WARN ${new Date().toISOString()}]`, msg);
    },
    error: (msg) => {
      console.error(`[ERROR ${new Date().toISOString()}]`, msg);
      connectionState = "error";
    },
    trace: (msg) => {
      console.log(`[TRACE ${new Date().toISOString()}]`, msg);
    },
  },
});

const eventDispatcher = new Lark.EventDispatcher({}).register({
  "im.message.receive_v1": async (data) => {
    hasReceivedData = true;
    console.log("");
    console.log("📨 ======= Received message event! =======");
    console.log(JSON.stringify(data, null, 2));
    console.log("");
  },
});

console.log("🚀 Starting WebSocket client...");
console.log("   This will keep running for 60 seconds to monitor the connection.");
console.log('   If you see "WebSocket CONNECTED", go to Feishu to configure events.');
console.log("");

// Start the WebSocket client
wsClient
  .start({ eventDispatcher })
  .then(() => {
    console.log("");
    console.log("✅ wsClient.start() Promise resolved");
    console.log(`   Current state: ${connectionState}`);
    console.log("");
  })
  .catch((err) => {
    console.error("");
    console.error("❌ wsClient.start() Promise rejected!");
    console.error("");
    console.error("Error:", err);
    console.error("");
    process.exit(1);
  });

// Status check every 10 seconds
let statusCheckCount = 0;
const statusInterval = setInterval(() => {
  statusCheckCount++;
  console.log("");
  console.log(`📊 Status check #${statusCheckCount} (${new Date().toISOString()}):`);
  console.log(`   Connection state: ${connectionState}`);
  console.log(`   Has received data: ${hasReceivedData}`);
  console.log("");

  if (connectionState === "connected" || connectionState === "ready") {
    console.log("💡 Connection is active! You can configure Feishu event subscription now.");
    console.log("   Go to: Event Subscription → Use long connection → Add im.message.receive_v1");
    console.log("");
  }
}, 10000);

// Auto-stop after 60 seconds
setTimeout(() => {
  console.log("");
  console.log("⏰ 60 seconds elapsed. Stopping test...");
  console.log("");
  console.log("📋 Final Summary:");
  console.log(`   Connection state: ${connectionState}`);
  console.log(`   Has received data: ${hasReceivedData}`);
  console.log("");

  if (connectionState === "connected" || connectionState === "ready") {
    console.log("✅ WebSocket connection was successful!");
    console.log('   If Feishu still says "no connection", the issue may be:');
    console.log("   1. Feishu checks for a connection from a different IP");
    console.log('   2. There\'s a timing issue - try configuring faster after seeing "connected"');
    console.log("   3. The app needs to be published first");
  } else {
    console.log("❌ WebSocket connection failed or incomplete.");
    console.log("   Possible causes:");
    console.log("   - Network/firewall blocking WebSocket connections");
    console.log("   - Proxy configuration needed");
    console.log("   - SDK version incompatibility");
  }
  console.log("");

  clearInterval(statusInterval);
  process.exit(0);
}, 60000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("");
  console.log("🛑 Interrupted by user. Stopping...");
  console.log("");
  clearInterval(statusInterval);
  process.exit(0);
});
