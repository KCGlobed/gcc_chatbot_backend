#!/bin/sh
set -e

echo "Starting Chroma server on port 8000..."
# Use the official CLI, not uvicorn directly
# --path /chroma is optional but good for persistence within container
chroma run --host 0.0.0.0 --port 8000 --path /chroma &
CHROMA_PID=$!

echo "Waiting for Chroma to start..."
sleep 3

echo "Starting Node/Express on port ${PORT:-8080}..."
node dist/server.js

echo "Node process exited, shutting down Chroma..."
kill $CHROMA_PID || true
