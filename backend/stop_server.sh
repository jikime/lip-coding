#!/bin/bash
# Stop the backend server that's running in the background

cd "$(dirname "$0")"  # Navigate to the script directory

# Check if PID file exists
if [ -f server.pid ]; then
  PID=$(cat server.pid)
  echo "Stopping server with PID $PID..."
  
  # Try to kill the process gracefully
  kill $PID 2>/dev/null || echo "Process not found"
  
  # Remove the PID file
  rm server.pid
  echo "Server stopped"
else
  echo "No server PID file found"
  # Try to find and kill any uvicorn process related to our app
  pkill -f "uvicorn main:app" && echo "Killed running uvicorn process" || echo "No running uvicorn process found"
fi