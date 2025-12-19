#!/bin/bash

echo "🚀 Deploying Debt Tracker to Netlify"
echo "=================================="

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --build --prod

echo "✅ Deployment complete!"
echo "🔗 Check your Netlify dashboard for the site URL"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Set your MONGODB_URI environment variable in Netlify"
echo "   2. Set NODE_ENV=production in Netlify"
echo "   3. Configure your MongoDB Atlas to allow connections from 0.0.0.0/0"