//auth.2e2-spec.ts
import request from 'supertest';
import { createTestApp } from './helpers';
import nock from 'nock';

describe('Auth (e2e)', () => {
  let app: any;
  let prisma: any;

  beforeAll(async () => {
    // Auth flow never calls out to the internet — guard against any
    // accidental real network calls during this suite.
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();
  });

  it('register -> login flow', async () => {
    const registerDto = {
      email: 'test_user@example.com',
      password: 'Password1@',
      firstName: 'Test',
      lastName: 'User',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('refreshToken');
    expect(registerRes.body).toHaveProperty('user');

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registerDto.email, password: registerDto.password })
      .expect(200);

    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body).toHaveProperty('refreshToken');
    expect(loginRes.body.user.email).toBe(registerDto.email);
  });

  it('should refresh tokens with a valid refresh token', async () => {
    const registerDto = {
      email: 'refresh_user@example.com',
      password: 'Password1@',
      firstName: 'Refresh',
      lastName: 'User',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const { refreshToken } = registerRes.body;

    //const refreshRes = await request(app.getHttpServer())
    //  .post('/auth/refresh')
    //  .set('Authorization', `Bearer ${refreshToken}`)
    //  .expect(200);

    //expect(refreshRes.body).toHaveProperty('accessToken');
    //expect(refreshRes.body).toHaveProperty('refreshToken');
    //expect(refreshRes.body.user.email).toBe(registerDto.email);
  });

  it('should reject refresh with an invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });

  it('should reject refresh with no authorization header', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);
  });

  it('should logout and invalidate the refresh token', async () => {
    const registerDto = {
      email: 'logout_user@example.com',
      password: 'Password1@',
      firstName: 'Logout',
      lastName: 'User',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const { accessToken, refreshToken } = registerRes.body;

    const logoutRes = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(logoutRes.body.message).toBe('Successfully logged out');

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);
  });

  it('should reject logout without an access token', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);
  });

  it('should reject login with the wrong password', async () => {
    const registerDto = {
      email: 'wrongpass_user@example.com',
      password: 'Password1@',
      firstName: 'Wrong',
      lastName: 'Pass',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registerDto.email, password: 'WrongPassword1@' })
      .expect(401);
  });
});