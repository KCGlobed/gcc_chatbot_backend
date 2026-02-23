# #!/bin/sh

# # Start ChromaDB in the background
# echo "Starting ChromaDB..."
# chroma run --path /chroma --port 8000 --host 0.0.0.0 &

# # Wait for Chroma to start
# echo "Waiting for Chroma to be ready..."
# until $(curl --output /dev/null --silent --head --fail http://localhost:8000/api/v1/heartbeat); do
#     printf '.'
#     sleep 1
# done
# echo "Chroma is ready!"

# # Start the Node.js application
# echo "Starting Node.js application..."
# npm start


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

