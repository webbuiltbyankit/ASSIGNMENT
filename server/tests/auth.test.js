import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';

describe('FORME Authentication & RBAC Suite', () => {
  beforeAll(async () => {
    await connectDB();
    // Clean test users
    await User.deleteMany({ email: /@test-forme\.com$/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-forme\.com$/ });
    await disconnectDB();
  });

  const testEmail = `shopper_${Date.now()}@test-forme.com`;
  const testPassword = 'Password123!';
  let authCookie = null;

  it('Health endpoint returns 200 healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/auth/register creates a customer and sets HttpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test Customer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.passwordHash).toBeUndefined();

    // Check Set-Cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies[0];
    expect(authCookie).toContain('forme_session=');
    expect(authCookie.toLowerCase()).toContain('httponly');
  });

  it('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ERR_EMAIL_EXISTS');
  });

  it('POST /api/auth/register ignores client-supplied role: admin', async () => {
    const attackEmail = `tamper_${Date.now()}@test-forme.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: attackEmail,
        password: testPassword,
        role: 'admin', // Malicious escalation attempt
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('customer'); // Role remains customer
  });

  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ERR_INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me resolves authenticated user from cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('GET /api/auth/me returns 401 when no session cookie is supplied', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Customer role cannot access protected admin routes (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/ping')
      .set('Cookie', authCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ERR_FORBIDDEN');
  });
});
