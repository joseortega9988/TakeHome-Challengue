// refresh token Strategy 
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt'

@Injectable ()
export class RefreshTokenStrategy extends PassportStrategy(Strategy , 'jwt-refresh'){
    constructor (
        private configService: ConfigService, 
        private prisma : PrismaService
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

    // validatre refresh token  
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
        const user = await this.prisma.user.findUnique ({
            where : {id: payload.sub},
            select : {
                id:true,
                email:true,
                role:true,
                refreshToken:true,
            },
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException ('Invalid refresh token');
        }
        
        const refreshTokenMatches = await bcrypt.compare (refreshToken, user.refreshToken);
        
        if (!refreshTokenMatches){
            throw new UnauthorizedException ('Invalid refresh does not match');
        }

        return {id: user.id, email: user.email, role: user.role };
    }
}