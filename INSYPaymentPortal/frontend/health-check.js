const https = require('https');

console.log('🔍 Checking Customer Portal health...');

const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false, // Allow self-signed certificates
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Customer Portal is healthy and running');
    process.exit(0);
  } else {
    console.log(`❌ Customer Portal returned status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('❌ Customer Portal health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Customer Portal health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();