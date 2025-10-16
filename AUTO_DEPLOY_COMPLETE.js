import https from 'https';
import readline from 'readline';

// Render API configuration
const RENDER_API_BASE = 'https://api.render.com/v1';
const REPO_URL = 'https://github.com/Ashraf6000/darul-umah-school-system';

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

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function getApiKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.cyan}Enter your Render API Key (get it from https://dashboard.render.com/account/settings): ${colors.reset}`, (apiKey) => {
      rl.close();
      resolve(apiKey.trim());
    });
  });
}

async function createDatabase(apiKey) {
  log('🗄️ Creating PostgreSQL database...', 'blue');
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/databases',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const databaseData = {
    name: 'darul-umah-db',
    databaseName: 'darul_umah',
    user: 'darul_umah_user',
    plan: 'free'
  };

  try {
    const response = await makeRequest(options, databaseData);
    
    if (response.status === 201) {
      log('✅ Database created successfully!', 'green');
      return response.data;
    } else {
      log(`❌ Failed to create database: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating database: ${error.message}`, 'red');
    return null;
  }
}

async function createBackendService(apiKey, databaseUrl) {
  log('🚀 Creating backend web service...', 'blue');
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/services',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const serviceData = {
    type: 'web_service',
    name: 'darul-umah-backend',
    repo: REPO_URL,
    branch: 'main',
    buildCommand: 'npm install -g pnpm && pnpm install && pnpm run build:server && pnpm run db:generate',
    startCommand: 'pnpm start',
    plan: 'free',
    envVars: [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: '10000' },
      { key: 'DATABASE_URL', value: databaseUrl },
      { key: 'JWT_SECRET', generateValue: true }
    ]
  };

  try {
    const response = await makeRequest(options, serviceData);
    
    if (response.status === 201) {
      log('✅ Backend service created successfully!', 'green');
      return response.data;
    } else {
      log(`❌ Failed to create backend service: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating backend service: ${error.message}`, 'red');
    return null;
  }
}

async function createFrontendService(apiKey, backendUrl) {
  log('🎨 Creating frontend static site...', 'blue');
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/services',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const serviceData = {
    type: 'static_site',
    name: 'darul-umah-frontend',
    repo: REPO_URL,
    branch: 'main',
    buildCommand: 'npm install -g pnpm && pnpm install && pnpm run build:client',
    publishPath: 'dist/spa',
    plan: 'free',
    envVars: [
      { key: 'VITE_API_URL', value: backendUrl }
    ]
  };

  try {
    const response = await makeRequest(options, serviceData);
    
    if (response.status === 201) {
      log('✅ Frontend service created successfully!', 'green');
      return response.data;
    } else {
      log(`❌ Failed to create frontend service: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating frontend service: ${error.message}`, 'red');
    return null;
  }
}

async function deployCompleteSystem() {
  log('🚀 Starting Darul Umah School Management System Deployment...', 'bright');
  log('', 'reset');
  
  // Get API key
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    log('❌ API key is required to deploy the system', 'red');
    return;
  }

  // Step 1: Create Database
  const database = await createDatabase(apiKey);
  if (!database) {
    log('❌ Failed to create database. Deployment aborted.', 'red');
    return;
  }

  // Wait for database to be ready
  log('⏳ Waiting for database to be ready...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Step 2: Create Backend Service
  const backendService = await createBackendService(apiKey, database.connectionString);
  if (!backendService) {
    log('❌ Failed to create backend service. Deployment aborted.', 'red');
    return;
  }

  // Step 3: Create Frontend Service
  const frontendService = await createFrontendService(apiKey, backendService.serviceUrl);
  if (!frontendService) {
    log('❌ Failed to create frontend service. Deployment aborted.', 'red');
    return;
  }

  // Deployment Complete
  log('', 'reset');
  log('🎉 DEPLOYMENT COMPLETE!', 'bright');
  log('', 'reset');
  log('Your Darul Umah School Management System is now live:', 'green');
  log('', 'reset');
  log(`🌐 Frontend: ${frontendService.serviceUrl}`, 'cyan');
  log(`🔧 Backend: ${backendService.serviceUrl}`, 'cyan');
  log(`🗄️ Database: ${database.name}`, 'cyan');
  log('', 'reset');
  log('🔐 Default Login Credentials:', 'yellow');
  log('   Username: admin', 'yellow');
  log('   Password: admin123', 'yellow');
  log('', 'reset');
  log('🏫 System Features:', 'green');
  log('   ✅ Admin Dashboard - School management', 'green');
  log('   ✅ Student Management - Enrollment & tracking', 'green');
  log('   ✅ Attendance System - Daily records', 'green');
  log('   ✅ Marks/Results - Grade management', 'green');
  log('   ✅ Fee Management - Payment tracking', 'green');
  log('   ✅ ID Card Generation - QR codes', 'green');
  log('   ✅ Bilingual Support - English/Somali', 'green');
  log('   ✅ Mobile Responsive - Works on all devices', 'green');
  log('', 'reset');
  log('⏳ Note: Services may take 10-15 minutes to fully deploy and be accessible.', 'yellow');
  log('🚀 Your complete school management system is ready!', 'bright');
}

// Run the deployment
deployCompleteSystem().catch(console.error);
