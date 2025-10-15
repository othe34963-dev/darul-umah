# 🚀 Manual Deployment Guide - Render

Since the automated browser deployment requires GitHub authentication, here's a complete step-by-step guide to manually deploy your Darul Umah School Management System to Render.

## 📋 **Current Status**

✅ **System Preparation**: 100% Complete  
✅ **Deployment Files**: All created and ready  
✅ **Build Process**: Tested and working  
🔄 **Manual Steps**: Ready to execute  

---

## 🎯 **Step-by-Step Deployment Process**

### **Step 1: GitHub Setup (Required)**

1. **Create GitHub Account** (if you don't have one):
   - Go to [github.com](https://github.com)
   - Sign up for a free account
   - Verify your email

2. **Create New Repository**:
   - Click "New repository"
   - Name: `darul-umah-school-management`
   - Description: `Darul Umah School Management System`
   - Make it **Public** (required for free Render)
   - Don't initialize with README (we have files already)

3. **Push Your Code**:
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit - Darul Umah School Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/darul-umah-school-management.git
   git push -u origin main
   ```

### **Step 2: Render Account Setup**

1. **Complete GitHub Authentication**:
   - On the GitHub login page (where the browser is now)
   - Enter your GitHub username/email and password
   - Click "Sign in"
   - Authorize Render to access your repositories

2. **Render Dashboard**:
   - You'll be redirected to Render dashboard
   - Your account will be created automatically

### **Step 3: Create PostgreSQL Database**

1. **Create Database**:
   - In Render dashboard, click "New +"
   - Select "PostgreSQL"
   - Configure:
     - **Name**: `darul-umah-db`
     - **Plan**: Free
     - **Region**: Choose closest to your users
   - Click "Create Database"

2. **Save Connection String**:
   - Copy the **External Database URL**
   - Format: `postgresql://username:password@host:port/database`
   - Keep this secure - you'll need it for the backend

### **Step 4: Deploy Backend API**

1. **Create Web Service**:
   - In Render dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

2. **Configure Backend**:
   ```
   Name: darul-umah-backend
   Environment: Node
   Plan: Free
   Branch: main
   Root Directory: (leave empty)
   ```

3. **Build & Start Commands**:
   ```
   Build Command:
   npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate && pnpm run db:migrate
   
   Start Command:
   pnpm start
   ```

4. **Environment Variables**:
   Add these in the "Environment" section:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=<generate-a-strong-secret-key>
   FRONTEND_URL=https://darul-umah-frontend.onrender.com
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note the backend URL (e.g., `https://darul-umah-backend.onrender.com`)

### **Step 5: Deploy Frontend**

1. **Create Static Site**:
   - In Render dashboard, click "New +"
   - Select "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend**:
   ```
   Name: darul-umah-frontend
   Branch: main
   Root Directory: (leave empty)
   ```

3. **Build Settings**:
   ```
   Build Command:
   npm install -g pnpm && pnpm install && pnpm run build:client
   
   Publish Directory:
   dist/spa
   ```

4. **Environment Variables**:
   ```
   VITE_API_URL=https://darul-umah-backend.onrender.com
   ```

5. **Deploy**:
   - Click "Create Static Site"
   - Wait 3-5 minutes for deployment
   - Note the frontend URL (e.g., `https://darul-umah-frontend.onrender.com`)

### **Step 6: Update Backend CORS**

1. **Update Environment Variables**:
   - Go to your backend service in Render
   - Go to "Environment" tab
   - Add/Update: `FRONTEND_URL=https://your-frontend-url.onrender.com`
   - Save changes (this will restart the service)

### **Step 7: Seed Database (Optional)**

1. **Access Backend Shell**:
   - Go to your backend service in Render
   - Click "Shell" tab
   - Run the minimal seed command:
   ```bash
   pnpm run db:seed:minimal
   ```

2. **Verify Seeding**:
   - Check logs for success messages
   - Database will be set up without demo credentials

---

## 🎉 **Deployment Complete!**

### **Your Live URLs:**
- **Frontend**: `https://darul-umah-frontend.onrender.com`
- **Backend**: `https://darul-umah-backend.onrender.com`
- **API Health**: `https://darul-umah-backend.onrender.com/api/ping`

### **First-Time Setup:**
- **No Default Credentials**: You must register your first admin account
- **Registration**: Use the registration page to create your admin account
- **Security**: No demo credentials for production security

---

## 🔧 **Testing Your Deployment**

### **1. Backend Health Check**:
Visit: `https://your-backend-url.onrender.com/api/ping`
- Should return: `{"message":"pong"}`

### **2. Frontend Access**:
Visit: `https://your-frontend-url.onrender.com`
- Should load the login page
- Test login with admin credentials

### **3. First-Time Setup**:
- Register your first admin account
- Navigate to Settings
- Test academic year management
- Verify current year switching works
- Add teachers and students
- Test other features

---

## 🚨 **Important Notes**

### **Free Tier Limitations**:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30+ seconds
- Database: 1GB storage, 100 connections
- Consider upgrading for production use

### **Security Recommendations**:
- No default credentials - register your first admin account securely
- Generate strong JWT_SECRET
- Use environment variables for sensitive data
- Regularly backup your database
- Use strong passwords for all accounts

### **Performance Tips**:
- Monitor usage in Render dashboard
- Set up health checks
- Consider upgrading to paid plans for production
- Implement proper error handling

---

## 📞 **Troubleshooting**

### **Common Issues**:

1. **Build Failures**:
   - Check build logs in Render
   - Ensure all dependencies are in package.json
   - Verify build commands are correct

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Ensure database is created and running
   - Check if Prisma migrations ran successfully

3. **CORS Issues**:
   - Verify FRONTEND_URL environment variable
   - Check backend logs for CORS errors

4. **Frontend API Calls Failing**:
   - Verify VITE_API_URL environment variable
   - Check network tab in browser dev tools

---

## 🎯 **Next Steps After Deployment**

1. **Test All Features**:
   - User authentication
   - Academic year management
   - Student enrollment
   - All other school management features

2. **Customize for Your School**:
   - Update school information
   - Add your teachers and students
   - Configure academic years
   - Set up classes and subjects

3. **Go Live**:
   - Share URLs with school staff
   - Train users on the system
   - Monitor usage and performance

---

**🎉 Congratulations! Your Darul Umah School Management System is now live on the internet!**

The system includes all the academic year management features we implemented, plus the complete school management functionality - ready for real-world use!
