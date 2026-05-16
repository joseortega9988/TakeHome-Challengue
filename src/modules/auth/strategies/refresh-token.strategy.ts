// refresh token Strategy 
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

// 1. Importamos UsersService en lugar de PrismaService
import { UsersService } from "../../users/users.service"; // Ajusta la ruta según tu estructura de carpetas

@Injectable ()
export class RefreshTokenStrategy extends PassportStrategy(Strategy , 'jwt-refresh'){
    constructor (
        private configService: ConfigService, 
        // 2. Inyectamos UsersService aquí
        private usersService: UsersService
    ) {
        const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET') || 'defaultrefreshsecret2025';
        const options: StrategyOptionsWithRequest = {
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey : refreshSecret,
            passReqToCallback : true,
        };
        super(options);
    }

    // validate refresh token  
    async validate (req: Request, payload: {sub:string ; email: string}){
        console.log ('RefreshTokenStrategy.validate called');
        console.log ('Payload', { sub: payload.sub, email: payload.email});

        const authHeader = req.headers.authorization ;

        if (!authHeader){
            console.log ('No authorization header found');
            throw new UnauthorizedException ('Refresh Token not provided');
        }

        const refreshToken = authHeader.replace ('Bearer','').trim();
        if (!refreshToken) {
            throw new UnauthorizedException (
                'Refresh token is empty after extraction',
            );
        }

        // 3. Reemplazamos la consulta directa de Prisma por la llamada a nuestro servicio
        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException ('Invalid refresh token');
        }
        
        const refreshTokenMatches = await bcrypt.compare (refreshToken, user.refreshToken);
        
        if (!refreshTokenMatches){
            throw new UnauthorizedException ('Invalid refresh does not match');
        }

        // Retornamos la info básica que viajará en req.user
        return { id: user.id, email: user.email, role: user.role };
    }
}