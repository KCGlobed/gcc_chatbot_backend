#!/bin/sh

# Start ChromaDB in the background
echo "Starting ChromaDB..."
chroma run --path /chroma --port 8000 --host 0.0.0.0 &

# Wait for Chroma to start
echo "Waiting for Chroma to be ready..."
until $(curl --output /dev/null --silent --head --fail http://localhost:8000/api/v1/heartbeat); do
    printf '.'
    sleep 1
done
echo "Chroma is ready!"

# Start the Node.js application
echo "Starting Node.js application..."
npm start
