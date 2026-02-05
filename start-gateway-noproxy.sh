#!/bin/bash
# OpenClaw Gateway 启动脚本（禁用代理）
# 用于解决代理环境下 WebSocket 长连接无法建立的问题

echo "🚀 Starting OpenClaw Gateway without proxy..."
echo ""

# 取消代理环境变量并启动 gateway
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY pnpm openclaw gateway --verbose
