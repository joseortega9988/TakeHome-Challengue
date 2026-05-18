import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { createTestApp } from './helpers';

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
    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();
    await request(app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registerDto.email, password: registerDto.password })
      .expect(200);
    accessToken = login.body.accessToken;

    // 👇 LIMPIAMOS LOS MOCKS DE JEST ANTES DE CADA PRUEBA
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  // Función ayudante para mockear Fetch fácilmente
  const mockFetchResponse = (responses: Record<number, { status: number; data?: any }>) => {
    jest.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const id = parseInt(url.split('/').pop(), 10);
      const mock = responses[id];

      if (!mock) throw new Error(`Fetch no mockeado para la URL: ${url}`);
      if (mock.status >= 400) return { ok: false, status: mock.status } as any;

      return {
        ok: true,
        status: mock.status,
        json: async () => mock.data,
      } as any;
    });
  };

  // ─── Happy path ───────────────────────────────────────────────────────────

  it('adds pokemons and returns names (mocked PokeAPI)', async () => {
    // 👇 Mockeamos la respuesta usando Jest
    mockFetchResponse({
      1: { status: 200, data: { name: 'bulbasaur' } },
      4: { status: 200, data: { name: 'charmander' } },
    });

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1, 4] })
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    const names = res.body.map((p: any) => p.pokemonName).sort();
    expect(names).toEqual(['bulbasaur', 'charmander'].sort());
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
    mockFetchResponse({
      999: { status: 404 }, // Simulamos que el 999 no existe (Adiós Gimmighoul)
    });

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [999] })
      .expect(201);

    expect(res.body[0].pokemonName).toBe('unknown-999');
  });

  it('returns unknown-{id} when PokeAPI is unreachable', async () => {
    // Simulamos un error de red catastrófico
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1] })
      .expect(201);

    expect(res.body[0].pokemonName).toBe('unknown-1');
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  it('handles mixed valid and invalid PokeAPI responses', async () => {
    mockFetchResponse({
      1: { status: 200, data: { name: 'bulbasaur' } },
      999: { status: 404 },
    });

    const res = await request(app.getHttpServer())
      .post('/client/pokemon/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonIds: [1, 999] })
      .expect(201);

    const names = res.body.map((p: any) => p.pokemonName).sort();
    expect(names).toEqual(['bulbasaur', 'unknown-999'].sort());
  });

  it('adds a single pokemon correctly', async () => {
    mockFetchResponse({
      25: { status: 200, data: { name: 'pikachu' } },
    });

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