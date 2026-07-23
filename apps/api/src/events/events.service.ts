import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Event as EventEntity,
  EventCategory,
  EventStatus,
  UserRole,
} from '@eventmesh/shared-types';
import { EventRepository } from './events.repository';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventRepository) {}

  async createEvent(
    dto: Omit<EventEntity, 'id' | 'createdAt' | 'status' | 'organizerId'>,
    userId: string,
    userRole: UserRole,
  ): Promise<EventEntity> {
    if (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only organizers can create events');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new ForbiddenException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new ForbiddenException("Event can't start in the past");
    }

    return this.eventsRepository.create({
      ...dto,
      organizerId: userId,
    });
  }

  async getEventById(id: string): Promise<EventEntity> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with given Id not found`);
    }

    return event;
  }

  async listEvents(
    options: {
      limit?: number;
      cursor?: string;
      category?: EventCategory;
      startDateFrom?: string;
      startDateTo?: string;
    } = {},
  ): Promise<{ events: EventEntity[]; nextCursor?: string }> {
    return this.eventsRepository.findAll({
      limit: options.limit,
      cursor: options.cursor,
      category: options.category,
      startDateFrom: options.startDateFrom,
      startDateTo: options.startDateTo,
    });
  }

  async updateEvent(
    id: string,
    dto: Partial<Omit<EventEntity, 'id' | 'createdAt' | 'status'>>,
    userId: string,
    userRole: UserRole,
  ): Promise<EventEntity> {
    const event: EventEntity = await this.getEventById(id);

    if (userRole === UserRole.ORGANIZER && event.organizerId !== userId) {
      throw new ForbiddenException('You can only edit your own events');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new ForbiddenException('You cannot modify a cancelled event');
    }

    return this.eventsRepository.update(id, dto);
  }

  async publishEvent(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<EventEntity> {
    const event = await this.getEventById(id);

    if (userRole === UserRole.ORGANIZER && event.organizerId !== userId) {
      throw new ForbiddenException('Not your event');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new ForbiddenException('Only draft events can be published');
    }

    return this.eventsRepository.update(id, { status: EventStatus.PUBLISHED });
  }

  async unpublishEvent(id: string, userRole: UserRole): Promise<EventEntity> {
    const event = await this.getEventById(id);

    // Only admins can unpublish — prevents organizer abuse
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can unpublish events');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new ForbiddenException('Only published events can be unpublished');
    }

    return this.eventsRepository.update(id, { status: EventStatus.DRAFT });
  }

  async deleteEvent(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const event = await this.getEventById(id);

    if (userRole === UserRole.ORGANIZER && event.organizerId !== userId) {
      throw new ForbiddenException('Not your event');
    }

    return this.eventsRepository.delete(id);
  }
}
