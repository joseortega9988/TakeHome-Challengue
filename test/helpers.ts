import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // ← primera línea, antes de todo

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

import { ValidationPipe } from '@nestjs/common';


export async function createTestApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  process.env.NODE_ENV = 'test';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

// 👇 ¡ESTA ES LA LÍNEA MÁGICA QUE TE FALTA! 👇
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();

  const prisma = moduleFixture.get<PrismaService>(PrismaService);
  await prisma.cleanDatabase();

  return { app, prisma };
}