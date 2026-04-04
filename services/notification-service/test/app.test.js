const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.DB_FILE = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token';

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

test('GET /openapi.json exposes notification path parameters', async () => {
  const response = await request(app).get('/openapi.json');

  assert.equal(response.statusCode, 200);
  assert.equal(
    response.body.paths['/users/{userId}/notifications'].get.parameters[0].$ref,
    '#/components/parameters/userId'
  );
  assert.equal(
    response.body.paths['/notifications/{notificationId}/read'].patch.parameters[0].$ref,
    '#/components/parameters/notificationId'
  );
});

test('POST /internal/events requires internal token', async () => {
  const response = await request(app).post('/internal/events').send({});
  assert.equal(response.statusCode, 401);
});

test('POST /internal/events stores a notification with valid token', async () => {
  const response = await request(app)
    .post('/internal/events')
    .set('Authorization', 'Bearer test-internal-token')
    .send({
      eventType: 'transport.booking.created',
      sourceService: 'transport-service',
      userId: 'USR-STUDENT',
      title: 'Booking confirmed',
      message: 'Your booking is confirmed.',
      payload: { bookingId: 'BKG-1' },
      occurredAt: '2026-03-29T10:00:00+05:30'
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.stored, true);
});

test('GET /users/:userId/notifications requires auth', async () => {
  const response = await request(app).get('/users/USR-STUDENT/notifications');
  assert.equal(response.statusCode, 401);
});

test('GET /users/:userId/notifications returns stored notifications', async () => {
  const response = await request(app)
    .get('/users/USR-STUDENT/notifications')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.data), true);
});
