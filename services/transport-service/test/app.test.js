const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

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
const studentToken = jwt.sign({ sub: 'USR-STUDENT', role: 'student', email: 'student@my.sliit.lk' }, process.env.JWT_SECRET);

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.statusCode, 200);
});

test('GET /routes returns seeded routes', async () => {
  const response = await request(app).get('/routes');
  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.data), true);
});

test('POST /bookings requires auth', async () => {
  const response = await request(app).post('/bookings').send({ scheduleId: 'SCH-123' });
  assert.equal(response.statusCode, 401);
});

test('POST /bookings validates payload', async () => {
  const response = await request(app)
    .post('/bookings')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({});

  assert.equal(response.statusCode, 422);
});
