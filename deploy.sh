#!/bin/bash

# Deployment script for Darul Umah School Management System
# This script prepares the application for Render deployment

echo "🚀 Preparing Darul Umah for Render deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install -g pnpm
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm run build

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm run db:generate

echo "✅ Build complete! Ready for deployment."
echo ""
echo "📋 Deployment Instructions:"
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use the following settings:"
echo "   - Build Command: npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate"
echo "   - Start Command: pnpm start"
echo "   - Environment: Node"
echo "   - Plan: Free"
echo ""
echo "🔧 Environment Variables to set in Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - DATABASE_URL=<your-postgresql-connection-string>"
echo "   - JWT_SECRET=<your-jwt-secret>"
echo ""
echo "🌐 For the frontend, create a Static Site with:"
echo "   - Build Command: npm install -g pnpm && pnpm install && pnpm run build:client"
echo "   - Publish Directory: dist/spa"
echo "   - Environment Variable: VITE_API_URL=https://your-backend-url.onrender.com"
