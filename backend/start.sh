#!/bin/bash

echo "🚀 Starting Mentor-Mentee Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🌟 Starting backend server..."
echo "   Backend will be available at: http://localhost:8080"
echo "   API endpoints at: http://localhost:8080/api"
echo "   Swagger UI at: http://localhost:8080/docs"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server
python main.py