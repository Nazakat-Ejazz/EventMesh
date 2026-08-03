import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  Event as EventEntity,
  EventCategory,
  UserRole,
  CurrentUserPayload,
} from '@eventmesh/shared-types';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipes';
import { CreateEventDTO, CreateEventSchema } from './dto/create-event.dto';
import { UpdateEventDTO, UpdateEventSchema } from './dto/update-event.dto';
import { CognitoAuthGuard } from '@/auth/cognito-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
  @UseGuards(CognitoAuthGuard)
  async createEvent(
    @Body(new ZodValidationPipe(CreateEventSchema)) dto: CreateEventDTO,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.createEvent(dto, user.sub, user.role);
  }

  @Patch(':id')
  @UseGuards(CognitoAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEventSchema)) dto: UpdateEventDTO,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.updateEvent(id, dto, user.sub, user.role);
  }

  @Patch(':id/publish')
  @UseGuards(CognitoAuthGuard)
  async publishEvent(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.publishEvent(id, user.sub, user.role);
  }

  @Patch(':id/unpublish')
  @UseGuards(CognitoAuthGuard)
  async unpublishEvent(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.unpublishEvent(id, user.role);
  }

  @Delete(':id')
  @UseGuards(CognitoAuthGuard)
  async deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.eventsService.deleteEvent(id, user.sub, user.role);
  }
}
