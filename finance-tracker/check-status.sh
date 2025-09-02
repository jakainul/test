#!/bin/bash

echo "🔍 Finance Tracker Status Check"
echo "================================"

# Check if backend is running
echo "📦 Backend Status:"
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend server is running at http://localhost:5000"
    curl -s http://localhost:5000/api/health | jq .
else
    echo "❌ Backend server is not responding"
fi

echo ""

# Check if frontend is running
echo "🎨 Frontend Status:"
if curl -s http://localhost:3000 | grep -q "DOCTYPE html"; then
    echo "✅ Frontend server is running at http://localhost:3000"
else
    echo "❌ Frontend server is not responding"
fi

echo ""

# Check database
echo "📊 Database Status:"
if [ -f "/workspace/finance-tracker/backend/database.sqlite" ]; then
    echo "✅ Database file exists"
    cd /workspace/finance-tracker/backend
    echo "Tables in database:"
    sqlite3 database.sqlite ".tables" 2>/dev/null || echo "⚠️  Could not read database tables"
else
    echo "❌ Database file not found"
fi

echo ""
echo "🚀 If both servers are running, visit http://localhost:3000 to use the app!"