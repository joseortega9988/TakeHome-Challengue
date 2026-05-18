import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // O la ruta correcta de tu PrismaModule
import { ClientModule } from 'src/modules/client/client.module';

@Module({
  imports: [PrismaModule, ClientModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Esto permite que el AuthModule pueda usarlo
})
export class UsersModule {}