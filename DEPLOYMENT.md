# 🚀 Deployment Guide - Darul Umah School Management System

This guide will help you deploy both the backend and frontend to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **PostgreSQL Database**: Render provides free PostgreSQL databases

## 🗄️ Step 1: Create PostgreSQL Database

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `darul-umah-db`
   - **Plan**: Free
   - **Region**: Choose closest to your users
4. Click "Create Database"
5. **Save the connection string** - you'll need it for the backend

## 🔧 Step 2: Deploy Backend API

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

### Backend Configuration:
- **Name**: `darul-umah-backend`
- **Environment**: `Node`
- **Plan**: `Free`
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty
- **Build Command**: 
  ```bash
  npm install -g pnpm
  pnpm install
  pnpm run build:server
  pnpm run db:generate
  pnpm run db:migrate
  ```
- **Start Command**: 
  ```bash
  pnpm start
  ```

### Environment Variables:
Add these environment variables in Render:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `<your-postgresql-connection-string>` |
| `JWT_SECRET` | `<generate-a-strong-secret>` |

5. Click "Create Web Service"
6. **Wait for deployment** (5-10 minutes)
7. **Copy the backend URL** (e.g., `https://darul-umah-backend.onrender.com`)

## 🌐 Step 3: Deploy Frontend

1. Go to your Render dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:

### Frontend Configuration:
- **Name**: `darul-umah-frontend`
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty
- **Build Command**: 
  ```bash
  npm install -g pnpm
  pnpm install
  pnpm run build:client
  ```
- **Publish Directory**: `dist/spa`

### Environment Variables:
Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://darul-umah-backend.onrender.com` |

5. Click "Create Static Site"
6. **Wait for deployment** (3-5 minutes)
7. **Copy the frontend URL** (e.g., `https://darul-umah-frontend.onrender.com`)

## 🔄 Step 4: Update Backend CORS

1. Go to your backend service in Render
2. Go to "Environment" tab
3. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://darul-umah-frontend.onrender.com`
4. Click "Save Changes"
5. **Restart the service** (it will happen automatically)

## 🧪 Step 5: Test Deployment

1. **Test Backend**: Visit `https://your-backend-url.onrender.com/api/ping`
   - Should return: `{"message":"pong"}`

2. **Test Frontend**: Visit `https://your-frontend-url.onrender.com`
   - Should load the login page

3. **Test Full Flow**:
   - Login with admin credentials
   - Navigate through the dashboard
   - Test academic year management

## 🎯 Step 6: Seed Database (Optional)

To populate your database with sample data:

1. Go to your backend service in Render
2. Go to "Shell" tab
3. Run the seed command:
   ```bash
   pnpm run db:seed
   ```

## 📊 Monitoring & Maintenance

### Health Checks:
- Backend: `https://your-backend-url.onrender.com/api/ping`
- Frontend: `https://your-frontend-url.onrender.com`

### Logs:
- Check logs in Render dashboard for both services
- Monitor for errors and performance issues

### Database:
- Monitor database usage in Render dashboard
- Free tier has limitations (1GB storage, 100 connections)

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render
   - Ensure all dependencies are in `package.json`
   - Verify build commands are correct

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Ensure database is created and running
   - Check if Prisma migrations ran successfully

3. **CORS Issues**:
   - Verify `FRONTEND_URL` environment variable
   - Check backend logs for CORS errors

4. **Frontend API Calls Failing**:
   - Verify `VITE_API_URL` environment variable
   - Check network tab in browser dev tools

### Performance Tips:

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes 30+ seconds
   - Consider upgrading to paid plans for production

2. **Optimization**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies

## 🚀 Going Live

Once everything is working:

1. **Update DNS** (if using custom domain)
2. **Set up monitoring** (optional)
3. **Configure backups** for database
4. **Update documentation** with live URLs

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Test locally first
4. Contact Render support for platform issues

---

**🎉 Congratulations! Your Darul Umah School Management System is now live on Render!**
