#!/bin/bash
# Start autossh tunnel to backend then run Next.js dev server
# Uses SSH key auth (no password) — autossh auto-reconnects if tunnel drops

VPS_HOST="root@66.212.22.21"
LOCAL_PORT=5001

echo "🔌 Starting persistent SSH tunnel on port $LOCAL_PORT..."

# Kill stale tunnel/autossh if exists
pkill -f "autossh.*${LOCAL_PORT}" 2>/dev/null
lsof -ti:${LOCAL_PORT} | xargs kill -9 2>/dev/null
sleep 1

# Start autossh with key-based auth — no password needed
AUTOSSH_GATETIME=0 \
AUTOSSH_POLL=30 \
autossh -M 0 \
  -o StrictHostKeyChecking=no \
  -o ServerAliveInterval=20 \
  -o ServerAliveCountMax=3 \
  -o ExitOnForwardFailure=yes \
  -o ConnectTimeout=10 \
  -i ~/.ssh/id_ed25519 \
  -fNL ${LOCAL_PORT}:127.0.0.1:${LOCAL_PORT} $VPS_HOST

# Verify tunnel is up
sleep 2
if curl -s --max-time 5 http://localhost:${LOCAL_PORT}/api/products -o /dev/null; then
  echo "✅ Tunnel ready — Backend reachable at localhost:${LOCAL_PORT} (auto-reconnect enabled)"
else
  echo "❌ Tunnel failed — check VPS connection"
  exit 1
fi

echo "🚀 Starting Next.js dev server..."
npm run dev
