🚀 Full Stack Deployment & Production Setup Blueprint
This document contains complete, step-by-step instructions for deploying the University of Buea Academic Announcement System (UAIMS) using:

GitHub — Code repository hosting
Supabase — Managed PostgreSQL database
Render — Node.js Express backend deployment
Vercel — React / Vite frontend deployment
📌 Phase 1: Pushing Code to GitHub
Step 1: Link your GitHub Repository
In your local terminal (at the project root c:\Users\Admin\Desktop\UIAMS.1), run:

bash

# Set main branch name
git branch -M main
# Add your GitHub repository remote URL (replace URL with your repository link)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
# Push your code to GitHub
git push -u origin main
🗄️ Phase 2: PostgreSQL Database Provisioning (Supabase)
Sign in / Create Account: Go to https://supabase.com and log in.
Create New Project:
Project Name: ub-announcement-system (or preferred name)
Database Password: (Generate and copy a secure password)
Region: Select nearest region (e.g. Frankfurt or London)
Get Database Connection String:
Go to Project Settings → Database → Connection String → Select Transaction Pooler or Direct Connection (URI format).
Example format:
text

postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
Note: Ensure your password special characters are URL-encoded if needed.
⚙️ Phase 3: Backend Deployment (Render)
Sign in / Create Account: Go to https://render.com.
New Web Service:
Click New + → Web Service.
Connect your GitHub repository.
Configure Service Settings:
Name: ub-announcement-backend
Root Directory: backend
Environment: Node
Build Command: npm install && npx prisma generate
Start Command: npm start
Configure Environment Variables (Render Dashboard): Add the following under Environment:
PORT: 5000 (or leave default for Render)
NODE_ENV: production
DATABASE_URL: (Your Supabase connection string from Phase 2)
JWT_SECRET: (A long random string, e.g. ub_jwt_prod_secret_987654321_key)
JWT_REFRESH_SECRET: (Another long random string, e.g. ub_jwt_refresh_prod_secret_12345)
JWT_EXPIRES_IN: 15m
JWT_REFRESH_EXPIRES_IN: 7d
FRONTEND_URL: https://<YOUR_VERCEL_APP_NAME>.vercel.app (Add after Vercel deployment)
Deploy & Initialize Database:
Click Create Web Service.
Once Render builds the backend, run database migrations and seeding against your Supabase database from your local machine:
bash

# In local backend directory (with production DATABASE_URL in .env or environment):
npx prisma db push
node prisma/seed.js
Copy your deployed backend URL from Render (e.g. https://ub-announcement-backend.onrender.com).
💻 Phase 4: Frontend Deployment (Vercel)
Sign in / Create Account: Go to https://vercel.com.
Import Project:
Click Add New... → Project.
Import your GitHub repository.
Configure Vercel Settings:
Framework Preset: Vite
Root Directory: Select frontend
Build Command: npm run build
Output Directory: dist
Environment Variables: Add the following environment variable:
VITE_API_URL: https://ub-announcement-backend.onrender.com/api (Your Render backend URL + /api)
Deploy:
Click Deploy. Vercel will build and deploy your application.
You will receive a production URL (e.g. https://ub-announcement-system.vercel.app).
Update CORS on Render Backend:
Return to your Render dashboard → ub-announcement-backend → Environment.
Update FRONTEND_URL to https://ub-announcement-system.vercel.app so CORS allows requests.
🔒 Default Super Admin Credentials (Post-Seeding)
Account	Email	Password	Access Level
Super Admin	oassonkeng@gmail.com	Admin123!	L5_SUPER_ADMIN
📑 Post-Deployment Verification Checklist
 Supabase database status is Active with all tables generated via Prisma.
 Render backend service health check returns HTTP 200 at https://<backend-url>/api/health.
 Vercel frontend loads smoothly without CORS errors.
 Super Admin can log in, create announcements, view/change profile photos, react, and comment.
 Audio chime alerts and toasts work when receiving notifications.
