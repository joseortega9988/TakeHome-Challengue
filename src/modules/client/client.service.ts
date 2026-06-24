import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { PokemonResponseDto } from './dto/pokemos-response.dto'; // ← nombre exacto de tu archivo

@Injectable()
export class PokemonClient {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private async fetchPokemonName(pokemonId: number): Promise<string> {
    const pokeBaseApi = this.configService.get<string>('POKE_BASE_API');
    try {
      const response = await fetch(`${pokeBaseApi}/${pokemonId}`);
      if (!response.ok) return `unknown-${pokemonId}`;
      const pokeData = await response.json(); // ← sin DTO, solo usamos .name
      return pokeData.name;
    } catch (error) {
      console.error(`Error fetching pokemon ${pokemonId}:`, error);
      return `unknown-${pokemonId}`;
    }
  }

  async addPokemons(userId: string, dto: AddPokemonDto): Promise<PokemonResponseDto[]> { // ← corregido
    await this.prisma.userPokemon.createMany({
      data: dto.pokemonIds.map((pokemonId) => ({ userId, pokemonId })),
    });

    const created = await this.prisma.userPokemon.findMany({
      where: { userId, pokemonId: { in: dto.pokemonIds } },
    });

    return Promise.all(
      created.map(async (pokemon) => ({
        id: pokemon.id,
        pokemonId: pokemon.pokemonId,
        pokemonName: await this.fetchPokemonName(pokemon.pokemonId),
      })),
    );
  }

  async getPokemonNames(pokemonIds: number[]): Promise<{ id: number; name: string }[]> {
    return Promise.all(
      pokemonIds.map(async (id) => ({
        id,
        name: await this.fetchPokemonName(id),
      })),
    );
  }
}