const https = require('https');
const http = require('http');

const checkHealth = (useHttps = true) => {
    const protocol = useHttps ? https : http;
    const port = process.env.API_PORT || 3000;
    
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/health',
        method: 'GET',
        rejectUnauthorized: false, // Allow self-signed certificates
        timeout: 10000
    };

    console.log(`🔍 Performing health check (${useHttps ? 'HTTPS' : 'HTTP'})...`);

    return new Promise((resolve, reject) => {
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success && res.statusCode === 200) {
                        console.log(`✅ Backend health check PASSED via ${useHttps ? 'HTTPS' : 'HTTP'}`);
                        resolve(true);
                    } else {
                        console.log(`❌ Backend health check FAILED:`, data);
                        resolve(false);
                    }
                } catch (error) {
                    console.log(`❌ Health check response parsing failed:`, error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`❌ Health check request failed (${useHttps ? 'HTTPS' : 'HTTP'}):`, err.message);
            resolve(false);
        });

        req.on('timeout', () => {
            console.error(`❌ Health check timeout (${useHttps ? 'HTTPS' : 'HTTP'})`);
            req.destroy();
            resolve(false);
        });

        req.end();
    });
};

// Try HTTPS first, then fall back to HTTP
const performHealthCheck = async () => {
    console.log('🏥 Starting comprehensive health check...');
    
    // Try HTTPS first
    const httpsHealthy = await checkHealth(true);
    
    if (!httpsHealthy) {
        console.log('🔄 HTTPS failed, trying HTTP...');
        const httpHealthy = await checkHealth(false);
        
        if (!httpHealthy) {
            console.log('❌ All health checks failed');
            process.exit(1);
        }
    }
    
    console.log('✅ Application is healthy and responding');
    process.exit(0);
};

performHealthCheck();