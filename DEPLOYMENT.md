# Deployment Guide - Netlify

This guide will help you deploy your Debt Tracker application to Netlify.

## Prerequisites

1. **MongoDB Atlas Account**: You'll need a cloud MongoDB database
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine for testing)
3. Create a database user with read/write access
4. Get your connection string - it should look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/debt-tracker?retryWrites=true&w=majority
   ```
5. Make sure to whitelist Netlify's IP addresses or use `0.0.0.0/0` (all IPs) for simplicity

## Step 2: Deploy to Netlify

### Option A: Deploy from Git (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Netlify](https://app.netlify.com) and sign in
3. Click "New site from Git"
4. Choose your Git provider and authorize Netlify
5. Select your repository
6. Netlify should auto-detect the settings, but verify:
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify login` to authenticate
3. From your project root, run `netlify init`
4. Follow the prompts to create a new site
5. Run `netlify deploy --build` to deploy

## Step 3: Configure Environment Variables

1. In your Netlify site dashboard, go to "Site settings" → "Environment variables"
2. Add the following variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`

## Step 4: Test Your Deployment

1. Wait for the build to complete
2. Visit your site URL (provided by Netlify)
3. Test the API endpoints: `https://your-site.netlify.app/api/health`
4. Test adding/viewing debts in the UI

## Troubleshooting

### Build Errors
- Check the build logs in Netlify dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

### Database Connection Issues
- Verify your MongoDB URI is correct
- Check that your MongoDB cluster allows connections from `0.0.0.0/0`
- Ensure environment variables are set correctly in Netlify

### API Not Working
- Check the Functions tab in Netlify dashboard for logs
- Verify the API routes are accessible at `https://your-site.netlify.app/api/`
- Check browser developer tools for CORS errors

### Common Fixes

1. **"Function not found" errors**: Make sure your netlify.toml is in the project root
2. **CORS errors**: Ensure your API function has proper CORS headers
3. **Database timeouts**: MongoDB Atlas free tier may have connection limits

## Local Development

To test the Netlify Functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Install dependencies
npm run install:all

# Start local development with Netlify Functions
netlify dev
```

This will serve your site at `http://localhost:8888` with functions at `http://localhost:8888/.netlify/functions/`.

## Continuous Deployment

Once connected to Git, Netlify will automatically rebuild and deploy your site whenever you push to your main branch. You can configure this behavior in the site settings.

## Performance Tips

1. Enable build plugins for optimization
2. Use Netlify's CDN for static assets
3. Consider implementing caching headers for API responses
4. Monitor your function usage to avoid limits

## Support

If you encounter issues:
1. Check Netlify's build logs and function logs
2. Review MongoDB Atlas logs
3. Test API endpoints directly using tools like Postman
4. Check the browser console for client-side errors