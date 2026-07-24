import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventRepository } from './events.repository';
import { EventsController } from './events.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
})
export class EventsModule {}
