import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import developmentConfig from './config/development';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [developmentConfig],
    }),
    CommonModule,
    EventsModule,
    AuthModule,
  ],
})
export class AppModule {}
