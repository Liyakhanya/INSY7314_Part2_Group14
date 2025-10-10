const axios = require('axios');

const testData = {
  fullName: "Test User",
  idNumber: "TEST123456",
  accountNumber: "ACC123456789",
  username: "testuser123",
  password: "SecurePass123!"
};

// Test the registration endpoint directly
axios.post('https://localhost:3000/v1/auth/register', testData, {
  httpsAgent: new (require('https').Agent)({
    rejectUnauthorized: false // Allow self-signed certificates
  })
})
.then(response => {
  console.log('✅ Registration successful:', response.data);
})
.catch(error => {
  console.log('❌ Registration failed:');
  console.log('Status:', error.response?.status);
  console.log('Error:', error.response?.data);
  console.log('Full error:', error.message);
});