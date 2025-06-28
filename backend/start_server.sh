#!/bin/bash
# Start the FastAPI backend server in the background

cd "$(dirname "$0")"  # Navigate to the script directory

# Kill any existing uvicorn process if it exists
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "python.*main:app" 2>/dev/null

# Setup virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    /opt/homebrew/bin/python3 -m venv venv
fi

# Activate virtual environment and install requirements
source venv/bin/activate

# Install required packages
pip install fastapi uvicorn sqlalchemy bcrypt "python-jose[cryptography]"

# Start the server in the background
echo "Starting server..."
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &

# Save the PID to a file
echo $! > server.pid

echo "Server started in the background with PID $(cat server.pid)"
echo "Server logs are saved to server.log"