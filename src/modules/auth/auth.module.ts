import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jws.strategies';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports : [
    PrismaModule,
    PassportModule.register({defaultStrategy : 'jwt'}),  
    JwtModule.registerAsync ({
        inject : [ConfigService],
        useFactory : (configService : ConfigService) => ({
            secret : configService.get <string> ('JWT_SECRET')?? 'defaultsecret2025',
            signOptions : {
                expiresIn : Number(configService.get<number>('JWT_EXPIRES_IN',900)),
            },
        }),
    }),
  ],
providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
controllers: [AuthController]
})

export class AuthModule {}
