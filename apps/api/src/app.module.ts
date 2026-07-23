import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { EventsService } from './events/events.service';
import developmentConfig from './config/development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [developmentConfig],
    }),
    CommonModule,
  ],
  providers: [EventsService],
})
export class AppModule {}
