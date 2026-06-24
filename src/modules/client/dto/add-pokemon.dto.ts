import { IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPokemonDto {
  @ApiProperty({
    description: 'List of Pokemon IDs to add to your collection',
    example: [1, 4, 7],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  pokemonIds: number[];
}