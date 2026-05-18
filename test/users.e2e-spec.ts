import request from 'supertest';
import { createTestApp } from './helpers';
import nock from 'nock';

describe('Users (e2e)', () => {
  let app: any;
  let prisma: any;
  let accessToken: string;

  beforeAll(async () => {
    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;

    const registerDto = {
      email: 'profile_user@example.com',
      password: 'Password1@',
      firstName: 'Profile',
      lastName: 'User',
      pokemonIds: [1, 4],
    };

    // Mock PokeAPI for profile fetching
    nock('https://pokeapi.co').get('/api/v2/pokemon/1').reply(200, { id: 1, name: 'bulbasaur' });
    nock('https://pokeapi.co').get('/api/v2/pokemon/4').reply(200, { id: 4, name: 'charmander' });

    await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email: registerDto.email, password: registerDto.password }).expect(200);
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();
    // re-register user
    const registerDto = {
      email: 'profile_user@example.com',
      password: 'Password1@',
      firstName: 'Profile',
      lastName: 'User',
      pokemonIds: [1, 4],
    };
    nock('https://pokeapi.co').get('/api/v2/pokemon/1').reply(200, { id: 1, name: 'bulbasaur' });
    nock('https://pokeapi.co').get('/api/v2/pokemon/4').reply(200, { id: 4, name: 'charmander' });
    await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email: registerDto.email, password: registerDto.password }).expect(200);
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
