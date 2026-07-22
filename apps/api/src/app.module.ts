import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import developmentConfig from './config/development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [developmentConfig],
    }),
  ],
})
export class AppModule {}
