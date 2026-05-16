// JWT Strategy for auth Requests 
import { PassportStrategy } from "@nestjs/passport"
import {Injectable, UnauthorizedException} from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import {ConfigService} from '@nestjs/config'
import {ExtractJwt, Strategy} from 'passport-jwt'

import { UsersService } from "../../users/users.service"   ; // Asegúrate de colocar la ruta relativa correcta

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor (
        // 2. Inyectamos UsersService aquí
        private usersService: UsersService, 
        private configService: ConfigService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET') || 'defaultsecret2025';
        super ({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    // Validate JWT payload
    async validate (payload: { sub: string ; email: string}) {
        // 3. Delegamos la búsqueda al UsersService
        const user = await this.usersService.findById(payload.sub);
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Removemos la contraseña por seguridad antes de adjuntar el usuario a la Request
        const { password, refreshToken, ...userWithoutPassword } = user;
        
        return userWithoutPassword;
    }
}