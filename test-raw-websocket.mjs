#!/usr/bin/env node

import https from "https";
import WebSocket from "ws";

const appId = "cli_a909aebd96b89cc2";
const appSecret = "UkOnnSDmh53tJyiGU8N3HhN1DZi4PKwM";

console.log("🔍 Testing raw WebSocket connection to Feishu...");
console.log("");

// Step 1: Get WebSocket endpoint configuration
console.log("📡 Step 1: Fetching WebSocket endpoint configuration...");

const postData = JSON.stringify({
  AppID: appId,
  AppSecret: appSecret,
});

const options = {
  hostname: "open.feishu.cn",
  port: 443,
  path: "/callback/ws/endpoint",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("✅ Received endpoint configuration");
    console.log("");

    try {
      const response = JSON.parse(data);

      if (response.code !== 0) {
        console.error("❌ Failed to get endpoint configuration:");
        console.error(JSON.stringify(response, null, 2));
        process.exit(1);
      }

      const wsUrl = response.data.URL;
      console.log("🔗 WebSocket URL:", wsUrl);
      console.log("");

      // Step 2: Try to connect to WebSocket
      console.log("📡 Step 2: Attempting WebSocket connection...");
      console.log("");

      const ws = new WebSocket(wsUrl, {
        headers: {
          "User-Agent": "OpenClaw/1.0",
        },
        handshakeTimeout: 10000,
        followRedirects: true,
      });

      // Connection opened
      ws.on("open", () => {
        console.log("");
        console.log("🎉 ======= WebSocket connection OPENED! =======");
        console.log("");
        console.log("✅ Successfully connected to Feishu WebSocket server");
        console.log("⏰ Connection established at:", new Date().toISOString());
        console.log("");
        console.log("💡 NOW is the time to configure in Feishu Open Platform!");
        console.log("   Go to: Event Subscription → Use long connection → Save");
        console.log("");
        console.log("📋 Keeping connection open for 30 seconds...");
        console.log("");

        // Keep connection alive for 30 seconds
        setTimeout(() => {
          console.log("⏰ 30 seconds elapsed. Closing connection...");
          ws.close();
        }, 30000);
      });

      // Connection error
      ws.on("error", (error) => {
        console.error("");
        console.error("❌ ======= WebSocket connection ERROR! =======");
        console.error("");
        console.error("Error:", error.message);
        console.error("");
        console.error("Error details:", error);
        console.error("");
        console.error("Possible causes:");
        console.error("  - Proxy blocking WebSocket connections");
        console.error("  - Firewall rules");
        console.error("  - SSL/TLS certificate issues");
        console.error("  - Network connectivity problems");
        console.error("");

        if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
          console.error("ℹ️  Proxy detected:");
          console.error(`   HTTP_PROXY: ${process.env.HTTP_PROXY || "not set"}`);
          console.error(`   HTTPS_PROXY: ${process.env.HTTPS_PROXY || "not set"}`);
          console.error("");
        }

        process.exit(1);
      });

      // Connection closed
      ws.on("close", (code, reason) => {
        console.log("");
        console.log("🔌 WebSocket connection closed");
        console.log(`   Code: ${code}`);
        console.log(`   Reason: ${reason || "none"}`);
        console.log("");
        process.exit(0);
      });

      // Receive messages
      ws.on("message", (data) => {
        console.log("📨 Received message from server:");
        console.log(data.toString());
        console.log("");
      });

      // Ping/Pong for keepalive
      ws.on("ping", () => {
        console.log("🏓 Received ping from server");
      });

      ws.on("pong", () => {
        console.log("🏓 Received pong from server");
      });
    } catch (error) {
      console.error("❌ Failed to parse endpoint configuration:", error);
      process.exit(1);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Failed to fetch endpoint configuration:", error);
  process.exit(1);
});

req.write(postData);
req.end();

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("");
  console.log("🛑 Interrupted by user");
  process.exit(0);
});
