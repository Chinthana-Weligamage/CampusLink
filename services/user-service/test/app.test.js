const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DB_FILE = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token';
process.env.NOTIFICATION_SERVICE_URL = 'http://127.0.0.1:3999';

const { migrate } = require('../src/db/migrate');
const { seed } = require('../src/db/seed');
const { createApp } = require('../src/app');

migrate();
seed();

const app = createApp();

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('POST /register creates a student account', async () => {
  const response = await request(app)
    .post('/register')
    .send({
      studentNo: 'IT2026999',
      fullName: 'Test Student',
      email: 'test.student@my.sliit.lk',
      password: 'Student@123',
      faculty: 'Computing',
      specialization: 'IT',
      intakeYear: 2026,
      defaultPickupStop: 'Kaduwela'
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, 'test.student@my.sliit.lk');
});

test('POST /register rejects invalid email domain', async () => {
  const response = await request(app)
    .post('/register')
    .send({
      studentNo: 'IT2026888',
      fullName: 'Invalid Student',
      email: 'invalid@example.com',
      password: 'Student@123',
      faculty: 'Computing',
      specialization: 'IT',
      intakeYear: 2026
    });

  assert.equal(response.statusCode, 422);
  assert.equal(response.body.success, false);
});

test('GET /me rejects missing auth token', async () => {
  const response = await request(app).get('/me');

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});
