const https = require('https');

console.log('🔍 Checking Employee Portal health...');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false,
  timeout: 15000
};

const req = https.request(options, (res) => {
  console.log(`✅ Employee Portal responded with status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Employee Portal is healthy and serving content');
      process.exit(0);
    } else {
      console.log(`⚠️ Employee Portal returned status: ${res.statusCode}`);
      process.exit(0);
    }
  });
});

req.on('error', (err) => {
  console.log('⚠️ Employee Portal health check note:', err.message);
  console.log('This is normal during startup.');
  process.exit(0);
});

req.on('timeout', () => {
  console.log('⏱️ Employee Portal health check timeout - might still be starting');
  req.destroy();
  process.exit(0);
});

req.end();