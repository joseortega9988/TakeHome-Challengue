import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module'; 
import { ConfigModule } from '@nestjs/config';

@Global ()
@Module({
  imports: [
    ConfigModule.forRoot ({
      isGlobal : true,
      envFilePath : '.env',
    }),
    PrismaModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
