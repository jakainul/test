# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Server Crashes on Startup

**Error**: `TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError`

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

This issue is caused by version conflicts in the Express.js dependency tree, particularly with the `path-to-regexp` module.

### 2. npm install Fails

**Error**: Various dependency resolution errors

**Solutions**:

#### For Backend:
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm audit fix
```

#### For Frontend:
```bash
cd frontend
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to React 19 compatibility issues with some Material-UI versions.

### 3. Frontend TypeScript Compilation Errors

**Error**: `Duplicate declaration "Dashboard"` and Material-UI Grid type errors

**Solution**: The code has been updated to fix these issues:
- Renamed the Dashboard icon import to `DashboardIcon`
- Added proper TypeScript types for function parameters
- Fixed Material-UI Grid component usage

### 4. Database Connection Issues

**Error**: Database file permission or path issues

**Solution**:
```bash
cd backend
# Ensure the backend directory is writable
chmod 755 .
# Remove existing database if corrupted
rm -f database.sqlite
# Restart the server to recreate the database
npm run dev
```

### 5. CORS Issues

**Error**: Frontend can't connect to backend API

**Solution**: Ensure both servers are running on the correct ports:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

Check the `.env` files:

**Backend `.env`**:
```
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`**:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find and kill the process using the port
lsof -ti:5000 | xargs kill -9
# Or use a different port in the .env file
```

## Quick Reset

If you encounter multiple issues, here's a complete reset procedure:

```bash
# Stop all servers
pkill -f "node.*server.js"
pkill -f "react-scripts"

# Clean backend
cd backend
rm -rf node_modules package-lock.json database.sqlite
npm cache clean --force
npm install

# Clean frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Restart both servers
cd ../backend && npm run dev &
cd ../frontend && npm start &
```

## Checking Server Status

### Backend Health Check:
```bash
curl http://localhost:5000/api/health
```
Expected response: `{"status":"OK","timestamp":"..."}`

### Frontend Check:
```bash
curl -s http://localhost:3000 | grep -q "DOCTYPE html" && echo "Frontend OK" || echo "Frontend Error"
```

## Common Development Commands

```bash
# Start both servers
cd /workspace/finance-tracker
./start.sh

# Start backend only
cd backend
npm run dev

# Start frontend only
cd frontend
npm start

# View backend logs
cd backend
npm run dev 2>&1 | tee server.log

# Check database
cd backend
sqlite3 database.sqlite ".tables"
```

## Environment Variables

Make sure these environment variables are set correctly:

**Backend** (`backend/.env`):
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secure_jwt_secret_change_this_in_production
DB_PATH=./database.sqlite
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```