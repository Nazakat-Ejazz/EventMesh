import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBClientProvider {
  public readonly client: DynamoDBClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('app.region')!;
    const endpoint = this.configService.get<string>('app.dynamodb.endpoint');

    const clientConfig: { region: string; endpoint?: string } = { region };

    if (endpoint && endpoint.includes('localhost')) {
      clientConfig.endpoint = endpoint;
    }

    const baseClient = new DynamoDBClient(clientConfig);

    this.client = DynamoDBDocumentClient.from(baseClient, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }
}
