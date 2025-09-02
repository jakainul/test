# Personal Finance Tracker

A comprehensive personal finance tracking application built with React, Node.js, and SQLite.

## Features

- 📊 **Dashboard** - Overview of income, expenses, and financial health
- 💰 **Transaction Management** - Add, edit, and categorize transactions
- 🏷️ **Category Management** - Create custom categories with colors and icons
- 📈 **Budget Tracking** - Set and monitor budgets with visual progress indicators
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔐 **User Authentication** - Secure login and registration
- 📊 **Data Visualization** - Charts and graphs for financial insights

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React** with TypeScript
- **Material-UI** for components and styling
- **Recharts** for data visualization
- **Axios** for API communication
- **date-fns** for date handling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Transactions
- `GET /api/transactions` - Get user transactions (with pagination and filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/stats` - Get transaction statistics

### Categories
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## Database Schema

The application uses SQLite with the following tables:
- **users** - User accounts and authentication
- **categories** - Transaction categories (income/expense)
- **transactions** - Financial transactions
- **budgets** - Budget limits and tracking

## Project Structure

```
finance-tracker/
├── backend/
│   ├── models/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── categories.js
│   │   └── budgets.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Budgets.tsx
│   │   │   └── Login.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.