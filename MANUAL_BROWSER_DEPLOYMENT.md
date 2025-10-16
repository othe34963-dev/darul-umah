# 🚀 **MANUAL BROWSER DEPLOYMENT GUIDE**

## **I'll guide you through each step using your browser!**

---

## 🎯 **STEP 1: Create Database**

### **1.1 Navigate to Render**
- **Open browser**: Go to https://dashboard.render.com
- **Sign in** to your Render account

### **1.2 Create PostgreSQL Database**
- **Click**: "New +" button (top right)
- **Select**: "PostgreSQL"
- **Configure**:
  ```
  Name: darul-umah-db
  Database: darul-umah-db
  User: darul-umah-user
  Plan: Free
  Region: Oregon (US West)
  ```
- **Click**: "Create Database"
- **Wait**: 2-3 minutes for database to be ready
- **Copy**: The connection string (you'll need this later)

---

## 🎯 **STEP 2: Create Backend Web Service**

### **2.1 Create Web Service**
- **Click**: "New +" button
- **Select**: "Web Service"
- **Connect GitHub**: 
  - Click "Connect GitHub account" if not connected
  - Select repository: `Ashraf6000/darul-umah-school-system`

### **2.2 Configure Backend**
- **Name**: `darul-umah-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: Node
- **Build Command**: 
  ```
  npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate
  ```
- **Start Command**: 
  ```
  pnpm start
  ```

### **2.3 Environment Variables**
- **Click**: "Advanced" → "Environment Variables"
- **Add these variables**:
  ```
  NODE_ENV = production
  PORT = 10000
  DATABASE_URL = [paste the connection string from Step 1]
  JWT_SECRET = [click "Generate" button]
  ```

### **2.4 Deploy Backend**
- **Click**: "Create Web Service"
- **Wait**: 10-15 minutes for deployment
- **Note**: The backend URL (e.g., `https://darul-umah-backend.onrender.com`)

---

## 🎯 **STEP 3: Create Frontend Static Site**

### **3.1 Create Static Site**
- **Click**: "New +" button
- **Select**: "Static Site"
- **Connect GitHub**: Select `Ashraf6000/darul-umah-school-system`

### **3.2 Configure Frontend**
- **Name**: `darul-umah-frontend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Build Command**: 
  ```
  npm install -g pnpm && pnpm install && pnpm run build:client
  ```
- **Publish Directory**: `dist/spa`

### **3.3 Environment Variables**
- **Click**: "Advanced" → "Environment Variables"
- **Add this variable**:
  ```
  VITE_API_URL = https://darul-umah-backend.onrender.com
  ```
  (Use the actual backend URL from Step 2)

### **3.4 Deploy Frontend**
- **Click**: "Create Static Site"
- **Wait**: 5-10 minutes for deployment
- **Note**: The frontend URL (e.g., `https://darul-umah-frontend.onrender.com`)

---

## 🎯 **STEP 4: Test Your System**

### **4.1 Access Your System**
- **Frontend URL**: `https://darul-umah-frontend.onrender.com`
- **Backend URL**: `https://darul-umah-backend.onrender.com`

### **4.2 Login Credentials**
- **Username**: `admin`
- **Password**: `admin123`

### **4.3 Test Features**
- ✅ **Login** to admin dashboard
- ✅ **Create** a new student
- ✅ **Check** attendance system
- ✅ **View** marks/results
- ✅ **Generate** ID cards

---

## 🎉 **DEPLOYMENT COMPLETE!**

### **Your System URLs:**
- **Frontend**: `https://darul-umah-frontend.onrender.com`
- **Backend**: `https://darul-umah-backend.onrender.com`
- **Database**: `darul-umah-db` (PostgreSQL)

### **System Features:**
- ✅ **Admin Dashboard** - School management
- ✅ **Student Management** - Enrollment & tracking
- ✅ **Attendance System** - Daily records
- ✅ **Marks/Results** - Grade management
- ✅ **Fee Management** - Payment tracking
- ✅ **ID Card Generation** - QR codes
- ✅ **Bilingual Support** - English/Somali
- ✅ **Mobile Responsive** - Works on all devices

---

## 🔧 **TROUBLESHOOTING**

### **If Backend Fails:**
1. **Check logs** in Render dashboard
2. **Verify** environment variables
3. **Ensure** database is running
4. **Check** build command syntax

### **If Frontend Fails:**
1. **Check logs** in Render dashboard
2. **Verify** VITE_API_URL is correct
3. **Ensure** build command works
4. **Check** publish directory path

### **If Database Connection Fails:**
1. **Verify** DATABASE_URL is correct
2. **Check** database is running
3. **Ensure** connection string format

---

## 🚀 **READY TO START?**

**Follow these steps in order:**
1. **Create Database** (Step 1)
2. **Create Backend** (Step 2)
3. **Create Frontend** (Step 3)
4. **Test System** (Step 4)

**Total time**: 20-30 minutes

---

**🎯 Let's start with Step 1 - Creating the database! Open your browser and go to https://dashboard.render.com**
