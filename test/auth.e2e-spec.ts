import request from 'supertest';
import { createTestApp } from './helpers';
import nock from 'nock';

describe('Auth (e2e)', () => {
  let app: any;
  let prisma: any;

  beforeAll(async () => {
    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
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
});
