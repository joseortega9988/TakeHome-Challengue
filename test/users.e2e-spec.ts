import request from 'supertest';
import { createTestApp } from './helpers';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('https://pokeapi.co/api/v2/pokemon/1', () =>
    HttpResponse.json({ id: 1, name: 'bulbasaur' }),
  ),
  http.get('https://pokeapi.co/api/v2/pokemon/4', () =>
    HttpResponse.json({ id: 4, name: 'charmander' }),
  ),
);

describe('Users (e2e)', () => {
  let app: any;
  let prisma: any;
  let accessToken: string;

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'bypass' });

    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  afterAll(async () => {
    await app.close();
    server.close();
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();

    const registerDto = {
      email: 'profile_user@example.com',
      password: 'Password1@',
      firstName: 'Profile',
      lastName: 'User',
      pokemonIds: [1, 4],
    };

    await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registerDto.email, password: registerDto.password })
      .expect(200);
    accessToken = login.body.accessToken;
  });

  it('returns user profile with pokemon names (mocked PokeAPI)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email');
    expect(Array.isArray(res.body.pokemons)).toBe(true);
    const names = res.body.pokemons.map((p: any) => p.name).sort();
    expect(names).toEqual(['bulbasaur', 'charmander'].sort());
  });
});
