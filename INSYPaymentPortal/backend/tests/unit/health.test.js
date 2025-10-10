const request = require('supertest');
const app = require('../../app');  
const { expect } = require('chai');

describe('Health Check API', () => {
  it('should return 200 and success message', async () => {
    const response = await request(app).get('/health');
    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.message).to.contain('International Payments API is running');
  });
});