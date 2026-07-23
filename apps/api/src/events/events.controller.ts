import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  Event as EventEntity,
  EventCategory,
  UserRole,
} from '@eventmesh/shared-types';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipes';
import { CreateEventDTO, CreateEventSchema } from './dto/create-event.dto';
import { UpdateEventDTO, UpdateEventSchema } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listEvents(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('category') category?: EventCategory,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.eventsService.listEvents({
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
      category,
      startDateFrom: from,
      startDateTo: to,
    });
  }

  @Get(':id')
  async getEvent(@Param('id') id: string): Promise<EventEntity> {
    // TODO: Add auth guard later
    return this.eventsService.getEventById(id);
  }

  @Post()
  async createEvent(
    @Body(new ZodValidationPipe(CreateEventSchema)) dto: CreateEventDTO,
  ) {
    // TODO: add auth guard later
    return this.eventsService.createEvent(
      dto,
      'temp-user-id',
      UserRole.ORGANIZER,
    );
  }

  @Patch(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEventSchema)) dto: UpdateEventDTO,
  ) {
    // // TODO: add auth guard later
    return this.eventsService.updateEvent(
      id,
      dto,
      'temp-user-id',
      UserRole.ORGANIZER,
    );
  }

  @Patch(':id/publish')
  async publishEvent(@Param('id') id: string) {
    // TODO: add auth guard later
    return this.eventsService.publishEvent(
      id,
      'temp-user-id',
      UserRole.ORGANIZER,
    );
  }

  @Patch(':id/unpublish')
  async unpublishEvent(@Param('id') id: string) {
    // TODO: add auth guard later
    return this.eventsService.unpublishEvent(id, UserRole.ADMIN);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    // TODO: add auth guard later
    return this.eventsService.deleteEvent(
      id,
      'temp-user-id',
      UserRole.ORGANIZER,
    );
  }
}
