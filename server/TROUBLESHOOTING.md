# Troubleshooting Guide

## "CANNOT GET /" Error

This error occurs when you try to access the root URL (`http://localhost:5000/`). 

**Solution:** The server now has a root route that will show API information. Try accessing:
- `http://localhost:5000/` - Shows API information
- `http://localhost:5000/api/health` - Health check endpoint
- `http://localhost:5000/api/debts` - Get all debts

## Server Not Starting

### 1. Check if dependencies are installed
```bash
cd server
npm install
```

### 2. Check if Node.js version is correct
```bash
node --version
```
Should be v16 or higher.

### 3. Check if port 5000 is already in use
```bash
# On Linux/Mac
lsof -i :5000

# On Windows
netstat -ano | findstr :5000
```

If the port is in use, either:
- Stop the other application using port 5000
- Change the PORT in your `.env` file

## MongoDB Connection Issues

### 1. Check if .env file exists
Make sure you have a `.env` file in the `server` directory with:
```env
MONGODB_URI=your_connection_string_here
PORT=5000
```

### 2. Verify MongoDB Atlas Connection String
- Go to MongoDB Atlas → Clusters → Connect → Connect your application
- Copy the connection string
- Replace `<password>` with your actual password
- Replace `<dbname>` with `debt-tracker` (or your preferred name)

Example format:
```
mongodb+srv://username:password@cluster.mongodb.net/debt-tracker?retryWrites=true&w=majority
```

### 3. Check MongoDB Atlas Network Access
- Go to MongoDB Atlas → Network Access
- Make sure your IP address is whitelisted (or use `0.0.0.0/0` for development)

### 4. Test Connection
Visit `http://localhost:5000/api/health` to see if MongoDB is connected.

## Common Errors

### "MongoServerError: bad auth"
- Check your MongoDB username and password
- Make sure special characters in password are URL-encoded

### "MongooseServerSelectionError"
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Check network access settings in MongoDB Atlas

### "EADDRINUSE: address already in use"
- Port 5000 is already in use
- Change PORT in `.env` file or stop the other application

## Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all debts
curl http://localhost:5000/api/debts

# Create a debt
curl -X POST http://localhost:5000/api/debts \
  -H "Content-Type: application/json" \
  -d '{"name":"Credit Card","totalAmount":5000,"monthlyPayment":200,"interestRate":18.5}'
```

### Using browser:
- Visit `http://localhost:5000/` to see API information
- Visit `http://localhost:5000/api/debts` to see all debts (if any exist)

## Still Having Issues?

1. Check the server console for error messages
2. Make sure all dependencies are installed: `npm install`
3. Verify your `.env` file is in the `server` directory
4. Check that MongoDB Atlas cluster is running and accessible

