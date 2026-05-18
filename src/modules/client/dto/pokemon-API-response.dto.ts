export class PokeApiResponseDto {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  // Puedes mapear más campos de la PokeAPI si en el futuro los necesitas
}