# GigFlow – Where Opportunities Flow to You

GigFlow is an AI-powered full-stack career ecosystem that combines job searching, freelancing, AI career tools, professional development, career coaching, learning resources, and career analytics into one seamless platform.

## Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3.
- **Backend**: Node.js, Express.js.
- **Database**: Local SQLite (`gigflow.db`).
- **Authentication**: Local Secure Emulator using SQLite.
- **AI Integration**: Google Gemini API.

## Environment Variables
To unlock the full functionality of GigFlow (AI generation, real databases, proper authentication), you must configure your environment variables. 

### Local Development
1. Create a file named `.env` in the root folder of the project (`GigFlow/.env`).
2. Add the following keys (replace the placeholders with your actual keys):
```env
# Database & Authentication
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_jwt_secret_string

# AI Integrations
GEMINI_API_KEY=your_google_gemini_api_key

# Port Configuration
PORT=5000
```
*Note: If any keys are missing, the server will intentionally print a `STARTUP WARNING` to the console and safely fall back to simulated offline modes (Auth Emulators + Simulated AI) so you can still test the UI!*

## Local Installation & Running

1. Open your terminal in the `GigFlow/` folder.
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:5000`.

### Troubleshooting `EADDRINUSE: address already in use :::5000`
If you encounter this error when running `npm start`, it means another server (or a previous instance of GigFlow) is still running in the background and holding Port 5000 hostage. 
**Fix:** Close your other terminal windows or manually kill the Node.js process using your computer's task manager, then run `npm start` again.

## Render Deployment Instructions

GigFlow is fully configured to be deployed as a **Node Web Service** on Render (Node 22 LTS).

1. Push your code to GitHub.
2. Go to your **Render Dashboard** and click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Use the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm run clean-install` (This custom command prevents caching bugs)
   - **Start Command**: `npm start`
5. **Environment Variables**: Scroll down and input all the variables listed in the `.env` section above directly into Render's Environment Variables panel.
6. Click **Create Web Service**. 

Render will automatically configure Node 22, install packages, and spin up your backend server.
