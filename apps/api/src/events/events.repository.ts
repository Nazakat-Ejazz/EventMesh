import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Event, EventCategory, EventStatus } from '@eventmesh/shared-types';
import { DynamoDBClientProvider } from '../common/dynamodb-client.provider';
import { generateId, nowIso } from '@eventmesh/shared-utils';

@Injectable()
export class EventsRepository {
  private readonly tableName: string;

  constructor(
    private dbProvider: DynamoDBClientProvider,
    private configService: ConfigService,
  ) {
    this.tableName = this.configService.get<string>('app.dynamodb.tableName')!;
  }

  get client(): DynamoDBDocumentClient {
    return this.dbProvider.client;
  }

  /* Method to create a new Event */
  async create(
    eventData: Omit<Event, 'id' | 'createdAt' | 'status'> & {
      organizerId: string;
    },
  ): Promise<Event> {
    const id = generateId();
    const event = {
      ...eventData,
      id,
      status: EventStatus.DRAFT,
      createdAt: nowIso(),
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `EVENT#${id}`,
          SK: 'METADATA',
          GSI1PK: `ORGANIZER#${event.organizerId}`,
          GSI1SK: `EVENT#${event.startDate}#${id}`,
          GSI2PK: 'EVENT',
          GSI2SK: `${event.startDate}#${id}`,
          ...event,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );

    return event;
  }

  /* Method to retrieve an event by ID */
  async findById(id: string): Promise<Event | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `EVENT#${id}`,
          SK: 'METADATA',
        },
      }),
    );

    if (!result.Item) {
      return null;
    }

    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...event } = result.Item;

    return event as Event;
  }

  /* List events with pagination and optional filtering. */
  async findAll(options: {
    limit?: number;
    cursor?: string;
    category?: EventCategory;
    startDateFrom?: string;
    startDateTo?: string;
  }): Promise<{ events: Event[]; nextCursor?: string }> {
    const {
      limit = 20,
      cursor,
      category,
      startDateFrom,
      startDateTo,
    } = options;

    // buld filter expression for category
    let filterExpression = '';
    const expressionAttributeValues: Record<string, unknown> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (category) {
      filterExpression = '#category = :category';
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = category;
    }

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk AND GSI2SK BETWEEN :from AND :to',
        FilterExpression: filterExpression || undefined,
        ExpressionAttributeNames:
          Object.keys(expressionAttributeNames).length > 0
            ? expressionAttributeNames
            : undefined,
        ExpressionAttributeValues: {
          ':pk': 'EVENT',
          ':from': startDateFrom ? `${startDateFrom}#` : '1970-01-01',
          ':to': startDateTo ? `${startDateTo}#\uffff` : '9999-12-31\uffff',
          ...expressionAttributeValues,
        },
        Limit: limit,
        ExclusiveStartKey: cursor
          ? JSON.parse(Buffer.from(cursor, 'base64').toString())
          : undefined,
        ScanIndexForward: true,
      }),
    );

    const events = (result.Items || []).map((item) => {
      const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...event } = item;
      return event as Event;
    });

    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined;

    return { events, nextCursor };
  }

  /* method to update an event */
  async update(
    id: string,
    updates: Partial<Omit<Event, 'id' | 'createdAt'>>,
  ): Promise<Event> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      if (value !== undefined) {
        updateExpression.push(`#f${index} = :v${index}`);
        expressionAttributeNames[`#f${index}`] = key;
        expressionAttributeValues[`:v${index}`] = value;
      }
    });

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `EVENT#${id}`,
          SK: 'METADATA',
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeNames,
        ConditionExpression: 'attribute_exists(PK)',
        ReturnValues: 'ALL_NEW',
      }),
    );

    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...event } =
      result.Attributes!;

    return event as Event;
  }

  /* method to delete an event */
  async delete(id: string): Promise<void> {
    await this.update(id, { status: EventStatus.CANCELLED });
  }
}
