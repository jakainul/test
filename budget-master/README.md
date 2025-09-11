# Budget Master 💰

A simple and elegant React application for tracking monthly salaries and expenses with automatic budget calculation.

## Features

- **Add Monthly Salaries**: Input your monthly salary in euros with month and year selection
- **Add Monthly Expenses**: Track your expenses with optional descriptions
- **Automatic Budget Calculation**: View your total salaries minus total expenses in real-time
- **Data Persistence**: All data is stored in a SQLite database
- **Modern UI**: Clean and responsive design with beautiful gradients and cards
- **Delete Entries**: Remove salary or expense entries as needed

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Styling**: Custom CSS with modern design principles

## Installation Instructions for macOS

### Prerequisites

Before installing Budget Master, make sure you have the following installed on your macOS system:

1. **Node.js and npm**
   ```bash
   # Check if you have Node.js installed
   node --version
   npm --version
   
   # If not installed, download from https://nodejs.org/
   # Or install using Homebrew:
   brew install node
   ```

2. **Git** (optional, for cloning)
   ```bash
   # Check if you have Git installed
   git --version
   
   # If not installed:
   brew install git
   ```

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # Option 1: Clone with Git
   git clone <repository-url>
   cd budget-master
   
   # Option 2: Download and extract the ZIP file, then navigate to the folder
   cd budget-master
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the Application**
   
   You'll need to run both the backend and frontend servers. Open two terminal windows:
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd budget-master/backend
   npm start
   ```
   The backend server will start on http://localhost:5001
   
   **Terminal 2 - Frontend Server:**
   ```bash
   cd budget-master/frontend
   npm start
   ```
   The frontend will start on http://localhost:3000 and automatically open in your browser.

### Quick Start Script

For convenience, you can create a startup script:

1. **Create a start script** (optional):
   ```bash
   # In the budget-master root directory
   cat > start.sh << 'EOF'
   #!/bin/bash
   echo "Starting Budget Master..."
   
   # Start backend in background
   cd backend && npm start &
   BACKEND_PID=$!
   
   # Wait a moment for backend to start
   sleep 3
   
   # Start frontend
   cd ../frontend && npm start
   
   # Cleanup function
   cleanup() {
       echo "Shutting down servers..."
       kill $BACKEND_PID
       exit 0
   }
   
   # Set trap to cleanup on script exit
   trap cleanup INT TERM
   
   # Wait for frontend to exit
   wait
   EOF
   
   chmod +x start.sh
   ./start.sh
   ```

### Troubleshooting

**Port Already in Use:**
If you get an error that port 3000 or 5001 is already in use, you can:
- Kill the process using the port: `lsof -ti:3000 | xargs kill -9` or `lsof -ti:5001 | xargs kill -9`
- Or change the port in the package.json scripts

**Database Issues:**
- The SQLite database file will be created automatically in the backend folder
- If you encounter database errors, delete the `budget.db` file and restart the backend

**Module Not Found Errors:**
- Make sure you ran `npm install` in both the backend and frontend directories
- Try deleting `node_modules` folders and running `npm install` again

**CORS Issues:**
- The frontend is configured to proxy requests to the backend
- Make sure both servers are running on their default ports (3000 and 5001)

### Using the Application

1. **Add Salaries**: Use the "Add Monthly Salary" form to input your monthly income
2. **Add Expenses**: Use the "Add Monthly Expense" form to track your spending
3. **View Budget**: The budget summary at the top shows your total income, expenses, and remaining balance
4. **Manage Entries**: View and delete individual salary and expense entries in the lists below

### Development Mode

If you want to run the application in development mode with auto-reload:

```bash
# Backend (with nodemon for auto-restart)
cd backend
npm run dev

# Frontend (already includes hot-reload)
cd frontend
npm start
```

### Building for Production

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/build` directory.

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/salaries` - Get all salaries
- `POST /api/salaries` - Add a new salary
- `DELETE /api/salaries/:id` - Delete a salary
- `GET /api/expenses` - Get all expenses  
- `POST /api/expenses` - Add a new expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/budget-summary` - Get budget summary (totals and balance)

## License

This project is open source and available under the MIT License.