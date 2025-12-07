<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1X1iXjvM6BFwpvdUuVSQGoyUvCs-CKqOA

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. For local development with API functions, install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your NeonDB credentials:
     ```
     NEON_PROJECT_HOST=ep-weathered-union-ahorbtng.c-3.us-east-1.aws.neon.tech
     NEON_API_TOKEN=your_api_token_here
     NEON_DB_NAME=neondb
     ```

4. Run the app with Vercel CLI (to enable API functions):
   ```bash
   vercel dev
   ```
   
   Or run with Vite only (API calls will fail locally, but works when deployed):
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `NEON_PROJECT_HOST`
   - `NEON_API_TOKEN`
   - `NEON_DB_NAME`
4. Deploy!

## Fix for CORS Issue

The CORS error has been fixed by:
- Moving database operations to serverless API functions (runs server-side)
- Frontend now calls `/api/*` endpoints instead of directly accessing NeonDB
- API functions handle CORS headers properly
