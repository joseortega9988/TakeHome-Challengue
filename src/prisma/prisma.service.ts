import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService 
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor () {
        // 1. Check the environment
        const isProduction = process.env.NODE_ENV === 'production';

        // 2. Configure the connection pool with conditional SSL
        const pool = new Pool({
            connectionString : process.env.DATABASE_URL,
            ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        });

        // 3. Pass the pool to the Prisma adapter
        const adapter = new PrismaPg(pool);

        super ({
            adapter,
            log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log ('Database connected successfully');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log ('Database disconnected');
    }
    async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot clean database in production');
    }

    await this.notification.deleteMany();
    await this.userPokemon.deleteMany();
    await this.user.deleteMany();
    }

}
