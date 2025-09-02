#!/bin/bash

echo "🚀 Starting Finance Tracker Application..."

# Function to handle cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📦 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend API: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID