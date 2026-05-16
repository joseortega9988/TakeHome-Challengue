import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
//Data transfert Object (dto) for user registration

export class RegisterDto {
    @ApiProperty({
        description: 'User email address',
        example: 'jose_o@example.com',
    })
    @IsEmail ({}, {message : 'Please provide a Valid Email Address'})
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'ContraseñaFuerte&Larga1@',
    })
    
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 chearacters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\s\-._~:/?#\[\]@!$&'()*+,;=áéíóúñàèìòùâêîôûäëïöüß]{8,}$/, {
        message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;


    @ApiProperty({
        description: 'User first name',
        example: 'Jose',
        required: false,
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Ortega',
        required: false,
    })
    @IsOptional()
    @IsString()
    lastName?: string;
}
