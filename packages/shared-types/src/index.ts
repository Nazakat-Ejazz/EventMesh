/* User Types */
export enum UserRole {
  ATTENDEE = 'attendee',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export enum EventCategory {
  CONCERT = 'concert',
  SPORTS = 'sports',
  THEATER = 'theater',
  CONFERENCE = 'conference',
  OTHER = 'other',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  status: EventStatus;
  capacity: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  organizerId: string;
}

/* Seat Types */
export enum SeatStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

export interface Seat {
  id: string;
  eventId: string;
  section: string;
  row: string;
  number: string;
  price: string;
  status: SeatStatus;
  lockedBy?: string;
  lockExpiry?: string;
}

/* Order Types */
export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REFUNDED = 'REFUNDED',
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  seatIds: string[];
  totalAmount: number;
  status: OrderStatus;
  paymentIntentId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

/* Payment types */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  createdAt: string;
}

/* Ticket types */
export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  seatId: string;
  userId: string;
  qrCodeData: string;
  status: TicketStatus;
  createdAt: string;
}

/* API RESPONSE TYPES */
export interface ApiError {
  code: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}
