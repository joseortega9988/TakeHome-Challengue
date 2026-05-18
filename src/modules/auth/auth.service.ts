import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service'; 
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { access } from 'fs';
import { JwtService} from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {

    private readonly SALT_ROUNDS = 12
    constructor ( 
        private usersService: UsersService, // Inyectamos UsersService en lugar de PrismaService
        private jwtService : JwtService,
        private configService: ConfigService,
    ) {}

    // Register a new user 
    async register (registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, firstName, lastName, pokemonIds } = registerDto;

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser){
            throw new ConflictException ("User With this Email Already exist");
        }

        try {
            const hashedPassword = await bcrypt.hash (password, this.SALT_ROUNDS);
        // Le pasamos el arreglo al método create como segundo parámetro
            const user = await this.usersService.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
            }, pokemonIds);
            const tokens = await this.generateTokens (user.id, user.email)
            await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

            return {
                ... tokens,
                user,
            };

        } catch (error){
            console.error ('Error during user registration :', error);
            throw new InternalServerErrorException (
                'An error occurred during registration',
            )
        }
    }

    private async generateTokens (
        userId : string , 
        email : string,
    ):  
        Promise<{ accessToken: string; refreshToken: string }> {
            const payload = { sub: userId, email };
            const refreshId = randomBytes(16).toString('hex');
            const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
                secret: this.configService.get<string>('JWT_SECRET'),
            }),
            this.jwtService.signAsync(
                { ...payload, refreshId },
                {
                expiresIn: '7d',
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                },
            ),
            ]);
            return { accessToken, refreshToken };
    }
    
    // Refresh Access Token
    async refreshTokens(userId: string): Promise<AuthResponseDto> {
        const user = await this.usersService.findById(userId);

        if (!user) {
        throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return {
        ...tokens,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as any,
        },
        };
    }

    // Log out

    async logout(userId: string): Promise<void> {
        // Delegamos la actualización al UsersService
        await this.usersService.updateRefreshToken(userId, null);
    }

    // log in 

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Delegamos la búsqueda al UsersService
        const user = await this.usersService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
        return {
        ...tokens,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        };
    }

}
