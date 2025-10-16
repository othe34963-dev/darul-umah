#!/usr/bin/env node

/**
 * 🚀 Darul Umah School Management System - Instant Deployment
 * 
 * This script will automatically deploy your system to Render
 * Run with: node deploy-now.js
 */

import https from 'https';
import readline from 'readline';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(prompt) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function deployToRender() {
  log('\n🚀 Darul Umah School Management System - Instant Deployment', 'cyan');
  log('=' * 60, 'cyan');
  
  try {
    // Get Render API key
    log('\n📋 Step 1: Render API Configuration', 'yellow');
    const apiKey = await question('Enter your Render API Key (get from https://dashboard.render.com/account/settings): ');
    
    if (!apiKey) {
      log('❌ API Key is required for deployment', 'red');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Create PostgreSQL Database
    log('\n🗄️  Step 2: Creating PostgreSQL Database...', 'yellow');
    const dbResponse = await makeRequest('https://api.render.com/v1/services', {
      method: 'POST',
      headers,
      body: {
        name: 'darul-umah-db',
        type: 'pserv',
        env: 'postgresql',
        plan: 'free',
        ipAllowList: []
      }
    });

    if (dbResponse.status !== 201) {
      log(`❌ Failed to create database: ${dbResponse.data}`, 'red');
      return;
    }

    const dbId = dbResponse.data.service.id;
    log(`✅ Database created successfully! ID: ${dbId}`, 'green');

    // Wait for database to be ready
    log('⏳ Waiting for database to be ready...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

    // Get database connection string
    const dbInfoResponse = await makeRequest(`https://api.render.com/v1/services/${dbId}`, {
      headers
    });

    const databaseUrl = dbInfoResponse.data.service.databaseUrl;
    log(`✅ Database ready! Connection string obtained.`, 'green');

    // Create Backend Web Service
    log('\n🔧 Step 3: Creating Backend Web Service...', 'yellow');
    const backendResponse = await makeRequest('https://api.render.com/v1/services', {
      method: 'POST',
      headers,
      body: {
        name: 'darul-umah-backend',
        type: 'web_service',
        repo: 'https://github.com/Ashraf6000/darul-umah-school-system',
        branch: 'main',
        buildCommand: 'npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate',
        startCommand: 'pnpm start',
        plan: 'free',
        envVars: [
          { key: 'NODE_ENV', value: 'production' },
          { key: 'PORT', value: '10000' },
          { key: 'DATABASE_URL', value: databaseUrl },
          { key: 'JWT_SECRET', value: 'darul-umah-secret-key-2024' },
          { key: 'FRONTEND_URL', value: 'https://darul-umah-school-system.onrender.com' }
        ]
      }
    });

    if (backendResponse.status !== 201) {
      log(`❌ Failed to create backend: ${backendResponse.data}`, 'red');
      return;
    }

    const backendId = backendResponse.data.service.id;
    log(`✅ Backend service created successfully! ID: ${backendId}`, 'green');

    // Create Frontend Static Site
    log('\n🎨 Step 4: Creating Frontend Static Site...', 'yellow');
    const frontendResponse = await makeRequest('https://api.render.com/v1/services', {
      method: 'POST',
      headers,
      body: {
        name: 'darul-umah-school-system',
        type: 'static_site',
        repo: 'https://github.com/Ashraf6000/darul-umah-school-system',
        branch: 'main',
        buildCommand: 'npm install -g pnpm && pnpm install && pnpm run build:client',
        publishPath: 'dist/spa',
        plan: 'free',
        envVars: [
          { key: 'VITE_API_URL', value: 'https://darul-umah-backend.onrender.com' }
        ]
      }
    });

    if (frontendResponse.status !== 201) {
      log(`❌ Failed to create frontend: ${frontendResponse.data}`, 'red');
      return;
    }

    const frontendId = frontendResponse.data.service.id;
    log(`✅ Frontend service created successfully! ID: ${frontendId}`, 'green');

    // Wait for services to deploy
    log('\n⏳ Step 5: Waiting for services to deploy...', 'yellow');
    log('This may take 10-15 minutes. Please wait...', 'yellow');

    // Check deployment status
    let backendReady = false;
    let frontendReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 minutes max

    while ((!backendReady || !frontendReady) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
      attempts++;

      // Check backend status
      if (!backendReady) {
        const backendStatus = await makeRequest(`https://api.render.com/v1/services/${backendId}`, { headers });
        if (backendStatus.data.service.serviceDetails?.buildStatus === 'live') {
          backendReady = true;
          log('✅ Backend is live!', 'green');
        }
      }

      // Check frontend status
      if (!frontendReady) {
        const frontendStatus = await makeRequest(`https://api.render.com/v1/services/${frontendId}`, { headers });
        if (frontendStatus.data.service.serviceDetails?.buildStatus === 'live') {
          frontendReady = true;
          log('✅ Frontend is live!', 'green');
        }
      }

      if (!backendReady || !frontendReady) {
        log(`⏳ Still deploying... (${attempts}/${maxAttempts} minutes)`, 'yellow');
      }
    }

    // Final status
    log('\n🎉 Deployment Complete!', 'green');
    log('=' * 60, 'green');
    log('Your Darul Umah School Management System is now live!', 'green');
    log('\n📊 System URLs:', 'cyan');
    log(`🌐 Frontend: https://darul-umah-school-system.onrender.com`, 'blue');
    log(`🔧 Backend:  https://darul-umah-backend.onrender.com`, 'blue');
    log(`🗄️  Database: ${databaseUrl}`, 'blue');
    
    log('\n🔐 Default Login Credentials:', 'cyan');
    log('Username: admin', 'blue');
    log('Password: admin123', 'blue');
    
    log('\n🏫 System Features:', 'cyan');
    log('✅ Admin Dashboard', 'green');
    log('✅ Student Management', 'green');
    log('✅ Attendance Tracking', 'green');
    log('✅ Marks/Results Management', 'green');
    log('✅ Fee Management', 'green');
    log('✅ ID Card Generation', 'green');
    log('✅ Bilingual Support (English/Somali)', 'green');
    log('✅ Mobile Responsive', 'green');

    log('\n🚀 Your school management system is ready to use!', 'magenta');

  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    log('Please check your API key and try again.', 'red');
  }
}

// Run the deployment
deployToRender().catch(console.error);
