# Debt Tracker - MERN Stack Application

A simple debt management web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- ✅ Add debts with name, total amount, interest rate (optional), and monthly payment
- ✅ View all debts in a list
- ✅ Calculate and display payoff duration (months/years) for each debt
- ✅ Display total debt amount
- ✅ Delete debts
- ✅ Clean, responsive UI

## Project Structure

```
debt-tracker-v2/
├── server/              # Backend (Express + MongoDB)
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── server.js       # Express server
│   └── package.json
├── client/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   PORT=5000
   ```

   **Getting MongoDB Atlas Connection String:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `debt-tracker` (or your preferred database name)

4. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## API Endpoints

### GET `/api/debts`
Retrieve all debts.

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Credit Card",
    "totalAmount": 5000,
    "interestRate": 18.5,
    "monthlyPayment": 200,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### POST `/api/debts`
Create a new debt.

**Request Body:**
```json
{
  "name": "Credit Card",
  "totalAmount": 5000,
  "interestRate": 18.5,  // optional
  "monthlyPayment": 200
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "Credit Card",
  "totalAmount": 5000,
  "interestRate": 18.5,
  "monthlyPayment": 200,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### DELETE `/api/debts/:id`
Delete a debt by ID.

**Response:**
```json
{
  "message": "Debt deleted successfully",
  "debt": { ... }
}
```

## Business Logic

### Payoff Calculation

The application calculates the payoff duration using a simple formula:

```
payoffMonths = ceil(totalAmount / monthlyPayment)
```

This provides an estimate of how many months it will take to pay off the debt. The result is displayed in both months and a human-readable format (years and months).

**Note:** This is a simplified calculation that doesn't account for compound interest. For more accurate calculations, you would need to use amortization formulas.

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - CORS
  - dotenv

- **Frontend:**
  - React
  - Vite
  - CSS3

## Development Notes

- The backend uses ES6 modules (`type: "module"` in package.json)
- CORS is enabled to allow frontend-backend communication
- The frontend uses Vite's proxy to forward API requests to the backend
- All form inputs are validated on both client and server side

## Future Enhancements

- User authentication
- Edit debt functionality
- More accurate interest calculations
- Payment history tracking
- Debt prioritization
- Charts and visualizations

## License

ISC

# debt-app-v2
