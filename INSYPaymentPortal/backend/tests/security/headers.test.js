const request = require('supertest');
const app = require('../../app');
const { expect } = require('chai');

describe('Security Headers - All Passing', () => {
  it('should have X-Frame-Options: DENY', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-frame-options']).to.equal('DENY');
  });

  it('should have X-Content-Type-Options: nosniff', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).to.equal('nosniff');
  });

  it('should have X-XSS-Protection (modern setting)', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-xss-protection']).to.equal('0');
  });

  it('should have Referrer-Policy', async () => {
  const response = await request(app).get('/health');
  expect(response.headers['referrer-policy']).to.equal('no-referrer');
});
});
