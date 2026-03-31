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
const adminToken = jwt.sign({ sub: 'USR-ADMIN', role: 'admin', email: 'admin@my.sliit.lk' }, process.env.JWT_SECRET);

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.statusCode, 200);
});

test('GET /docs redirects to /docs/ for Swagger asset loading', async () => {
  const response = await request(app).get('/docs');
  assert.equal(response.statusCode, 301);
  assert.equal(response.headers.location, '/docs/');
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

test('POST /announcements returns 404 for an unknown route', async () => {
  const response = await request(app)
    .post('/announcements')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      routeId: 'RTE-999',
      title: 'Morning shuttle delayed',
      message: 'The shuttle will leave 15 minutes later than usual.',
      type: 'delay'
    });

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
});
