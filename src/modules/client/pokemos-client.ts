import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PokemonClient } from './client.service';
import { AddPokemonDto } from './dto/add-pokemon.dto';
import { PokemonResponseDto } from './dto/pokemos-response.dto';

@ApiTags('client')
@ApiBearerAuth('JWT-auth')
@Controller('client')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: PokemonClient) {}

  @Post('pokemon/add')
  @ApiOperation({
    summary: 'Add pokemons to your collection',
    description: 'Receives a list of Pokemon IDs, saves them to the authenticated user, and returns their names resolved from PokeAPI.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pokemons added successfully.',
    type: [PokemonResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  async addPokemon(
    @GetUser('id') userId: string,
    @Body() dto: AddPokemonDto,
  ): Promise<PokemonResponseDto[]> {
    return this.clientService.addPokemons(userId, dto);
  }
}