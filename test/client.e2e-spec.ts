// client e2e spec
import request from 'supertest';
import { createTestApp } from './helpers';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const POKE_URL = 'https://pokeapi.co/api/v2/pokemon/:id';

const server = setupServer();

const registerDto = {
  email: 'client_user@example.com',
  password: 'Password1@',
  firstName: 'Client',
  lastName: 'User',
};

describe('Client (e2e)', () => {
  let app: any;
  let prisma: any;
  let accessToken: string;

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'bypass' });

    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  beforeEach(async () => {
    server.resetHandlers();
    await prisma.cleanDatabase();
    await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registerDto.email, password: registerDto.password })
      .expect(200);
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
    server.close();
  });

  // ─── Happy path ───────────────────────────────────────────────────────────

  it('adds pokemons and returns names (mocked PokeAPI)', async () => {
    const names: Record<string, string> = { '1': 'bulbasaur', '4': 'charmander' };
    server.use(
      http.get(POKE_URL, ({ params }) => {
        const name = names[params.id as string];
        if (!name) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json({ name });
      }),
    );

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1, 4] })
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    const resNames = res.body.map((p: any) => p.pokemonName).sort();
    expect(resNames).toEqual(['bulbasaur', 'charmander'].sort());
  });

  // ─── Auth ─────────────────────────────────────────────────────────────────

  it('returns 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .send({ pokemonIds: [1] })
      .expect(401);
  });

  it('returns 401 with invalid token', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ pokemonIds: [1] })
      .expect(401);
  });

  // ─── Validación del body ──────────────────────────────────────────────────

  it('returns 400 when pokemonIds is missing', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('returns 400 when pokemonIds contains strings', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: ['pikachu', 'bulbasaur'] })
      .expect(400);
  });

  it('returns 400 when pokemonIds contains zero or negative numbers', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [0, -1] })
      .expect(400);
  });

  it('returns 400 when pokemonIds is not an array', async () => {
    await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: 1 })
      .expect(400);
  });

  // ─── Fallos de PokeAPI ────────────────────────────────────────────────────

  it('returns unknown-{id} when PokeAPI returns 404', async () => {
    server.use(
      http.get(POKE_URL, () => new HttpResponse(null, { status: 404 })),
    );

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [999] })
      .expect(201);

    expect(res.body[0].pokemonName).toBe('unknown-999');
  });

  it('returns unknown-{id} when PokeAPI is unreachable', async () => {
    server.use(
      http.get(POKE_URL, () => HttpResponse.error()),
    );

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1] })
      .expect(201);

    expect(res.body[0].pokemonName).toBe('unknown-1');
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  it('handles mixed valid and invalid PokeAPI responses', async () => {
    server.use(
      http.get(POKE_URL, ({ params }) => {
        if (params.id === '1') return HttpResponse.json({ name: 'bulbasaur' });
        return new HttpResponse(null, { status: 404 });
      }),
    );

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1, 999] })
      .expect(201);

    const names = res.body.map((p: any) => p.pokemonName).sort();
    expect(names).toEqual(['bulbasaur', 'unknown-999'].sort());
  });

  it('adds a single pokemon correctly', async () => {
    server.use(
      http.get(POKE_URL, () => HttpResponse.json({ name: 'pikachu' })),
    );

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [25] })
      .expect(201);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].pokemonName).toBe('pikachu');
    expect(res.body[0].pokemonId).toBe(25);
  });
});
