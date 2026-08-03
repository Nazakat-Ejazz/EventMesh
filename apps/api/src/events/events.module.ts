import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventRepository } from './events.repository';
import { EventsController } from './events.controller';
import { CommonModule } from '../common/common.module';
import { CognitoAuthGuard } from '@/auth/cognito-auth.guard';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
})
export class EventsModule {}
