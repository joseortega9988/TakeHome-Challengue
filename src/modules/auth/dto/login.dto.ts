import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {

    @ApiProperty({
        description: 'User email address',
        example: 'jose_o@example.com',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'ContraseñaFuerte&Larga1@',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}