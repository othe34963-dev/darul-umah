import https from 'https';

const RENDER_API_BASE = 'https://api.render.com/v1';
const REPO_URL = 'https://github.com/Ashraf6000/darul-umah-school-system';

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

async function createDatabase(apiKey) {
  console.log('Creating database...');
  
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

  const response = await makeRequest(options, databaseData);
  return response.status === 201 ? response.data : null;
}

async function createBackendService(apiKey, databaseUrl) {
  console.log('Creating backend...');
  
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

  const response = await makeRequest(options, serviceData);
  return response.status === 201 ? response.data : null;
}

async function createFrontendService(apiKey, backendUrl) {
  console.log('Creating frontend...');
  
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

  const response = await makeRequest(options, serviceData);
  return response.status === 201 ? response.data : null;
}

async function deployAll() {
  const apiKey = process.argv[2];
  
  if (!apiKey) {
    console.log('Usage: node DEPLOY_NOW.js <API_KEY>');
    console.log('Get API key from: https://dashboard.render.com/account/settings');
    return;
  }

  console.log('Starting deployment...');

  const database = await createDatabase(apiKey);
  if (!database) {
    console.log('Failed to create database');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 30000));

  const backend = await createBackendService(apiKey, database.connectionString);
  if (!backend) {
    console.log('Failed to create backend');
    return;
  }

  const frontend = await createFrontendService(apiKey, backend.serviceUrl);
  if (!frontend) {
    console.log('Failed to create frontend');
    return;
  }

  console.log('Deployment complete!');
  console.log(`Frontend: ${frontend.serviceUrl}`);
  console.log(`Backend: ${backend.serviceUrl}`);
  console.log(`Database: ${database.name}`);
  console.log('Login: admin / admin123');
}

deployAll().catch(console.error);
