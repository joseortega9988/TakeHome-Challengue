import { Module } from '@nestjs/common';
import { ClientController } from './pokemos-client';
import { PokemonClient } from './client.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [PokemonClient],
  exports: [PokemonClient], // ← esto es todo
})
export class ClientModule {}