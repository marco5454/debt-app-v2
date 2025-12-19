# Server Setup

## Environment Variables

Create a `.env` file in this directory with the following:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/debt-tracker?retryWrites=true&w=majority
PORT=5000
```

Replace the MongoDB URI with your actual MongoDB Atlas connection string.

## Installation

```bash
npm install
```

## Running

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

