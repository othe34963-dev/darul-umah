# 🚀 **MANUAL DEPLOYMENT - Step by Step Guide**

## ✅ **Your Project is Ready**
- **GitHub Repository**: `https://github.com/Ashraf6000/darul-umah-school-system` ✅
- **All Files Uploaded**: ✅
- **Ready for Deployment**: ✅

---

## 🎯 **STEP 1: Create Frontend (Static Site)**

### **1.1 Go to Render Dashboard**
1. **Open**: https://dashboard.render.com
2. **Click**: "New +" (top right corner)
3. **Select**: "Static Site"

### **1.2 Connect GitHub Repository**
1. **Click**: "Connect GitHub"
2. **Find**: `Ashraf6000/darul-umah-school-system`
3. **Click**: "Connect"

### **1.3 Configure Frontend Settings**
```
Name: darul-umah-school-system
Build Command: npm install -g pnpm && pnpm install && pnpm run build:client
Publish Directory: dist/spa
```

### **1.4 Add Environment Variables**
Click "Advanced" and add:
```
VITE_API_URL: https://darul-umah-backend.onrender.com
```

### **1.5 Deploy Frontend**
1. **Click**: "Create Static Site"
2. **Wait**: 5-10 minutes for deployment
3. **Note the URL**: `https://darul-umah-school-system.onrender.com`

---

## 🎯 **STEP 2: Create Backend (Web Service)**

### **2.1 Create New Web Service**
1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect**: `Ashraf6000/darul-umah-school-system`

### **2.2 Configure Backend Settings**
```
Name: darul-umah-backend
Build Command: npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate
Start Command: pnpm start
```

### **2.3 Add Environment Variables**
```
NODE_ENV: production
PORT: 10000
JWT_SECRET: your-secret-key-here-123456
FRONTEND_URL: https://darul-umah-school-system.onrender.com
```

### **2.4 Deploy Backend**
1. **Click**: "Create Web Service"
2. **Wait**: 10-15 minutes for deployment
3. **Note the URL**: `https://darul-umah-backend.onrender.com`

---

## 🎯 **STEP 3: Create Database (PostgreSQL)**

### **3.1 Create Database**
1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "PostgreSQL"
3. **Configure**:
```
Name: darul-umah-db
Plan: Free
```

### **3.2 Get Connection String**
1. **Click**: "Create Database"
2. **Wait**: 2-3 minutes
3. **Copy the connection string** (looks like: `postgresql://user:pass@host:port/db`)

### **3.3 Add Database URL to Backend**
1. **Go to your backend service**
2. **Click**: "Environment"
3. **Add**:
```
DATABASE_URL: [paste the connection string here]
```
4. **Click**: "Save Changes"

---

## 🎯 **STEP 4: Update Frontend API URL**

### **4.1 Update Frontend Environment**
1. **Go to your frontend service**
2. **Click**: "Environment"
3. **Update**:
```
VITE_API_URL: https://darul-umah-backend.onrender.com
```
4. **Click**: "Save Changes"
5. **Click**: "Manual Deploy" → "Deploy latest commit"

---

## 🎯 **STEP 5: Test Your System**

### **5.1 Test Frontend**
1. **Go to**: `https://darul-umah-school-system.onrender.com`
2. **Verify**: Page loads without errors

### **5.2 Test Backend**
1. **Go to**: `https://darul-umah-backend.onrender.com/api/ping`
2. **Verify**: Returns `{"message":"pong"}`

### **5.3 Test Login**
1. **Go to**: `https://darul-umah-school-system.onrender.com/login`
2. **Login with**:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 🎉 **EXPECTED RESULT**

After completing all steps, you'll have:

### **🌐 Live URLs**
- **Frontend**: `https://darul-umah-school-system.onrender.com`
- **Backend**: `https://darul-umah-backend.onrender.com`
- **Admin Login**: `https://darul-umah-school-system.onrender.com/login`

### **🏫 Complete School Management System**
- ✅ **Admin Dashboard**
- ✅ **Student Management**
- ✅ **Attendance Tracking**
- ✅ **Marks/Results Management**
- ✅ **Fee Management**
- ✅ **ID Card Generation**
- ✅ **Bilingual Support** (English/Somali)
- ✅ **Mobile Responsive**

---

## 🔧 **TROUBLESHOOTING**

### **If Frontend Shows 404**
1. **Check**: Build command is correct
2. **Check**: Publish directory is `dist/spa`
3. **Check**: Environment variables are set

### **If Backend Fails to Start**
1. **Check**: Build command includes `pnpm run db:generate`
2. **Check**: Environment variables are set
3. **Check**: Database URL is correct

### **If Database Connection Fails**
1. **Check**: DATABASE_URL is set correctly
2. **Check**: Database service is running
3. **Check**: Connection string format

---

## 📞 **SUPPORT**

If you encounter any issues:
1. **Check the deployment logs** in Render dashboard
2. **Verify all environment variables** are set correctly
3. **Ensure all files are uploaded** to GitHub
4. **Contact support** if needed

---

**🚀 Follow these steps and your Darul Umah School Management System will be live and working perfectly!**
