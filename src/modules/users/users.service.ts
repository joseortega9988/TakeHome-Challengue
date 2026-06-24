


import { PokemonClient } from 'src/modules/client/client.service';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PokeApiResponseDto } from '../client/dto/pokemon-API-response.dto'; // Asegúrate de que este DTO exista

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private clientService: PokemonClient, // ← nuevo
  ) {}

  // Buscar un usuario por Email (Usado por AuthService para Login y Registro)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Buscar un usuario por ID
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

    // Actualizar el Refresh Token de un usuario
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

// Crear un nuevo usuario con Pokemons iniciales (Guardando solo el ID)
  async create(data: Prisma.UserCreateInput, pokemonIds?: number[]): Promise<User> {
    const pokemonsToCreate: { pokemonId: number }[] = [];

    if (pokemonIds && pokemonIds.length > 0) {
      pokemonsToCreate.push(...pokemonIds.map(id => ({ pokemonId: id })));
    }

    // Guardamos el usuario junto con sus Pokémons (solo el ID) en la BD
    return this.prisma.user.create({
      data: {
        ...data,
        pokemons: pokemonsToCreate.length > 0 ? {
          create: pokemonsToCreate,
        } : undefined,
      },
    });
  }

  // Obtener el perfil del usuario con nombres de pokemons fetched from PokeAPI
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        pokemons: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch pokemon names from PokeAPI

    const pokemonIds = user.pokemons.map((p) => p.pokemonId);
    const pokemonDetails = await this.clientService.getPokemonNames(pokemonIds); // ← delega


    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      pokemons: pokemonDetails,
    };
  }
}