import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBClientProvider {
  public readonly client: DynamoDBDocumentClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('app.region')!;
    const endpoint = this.configService.get<string>('app.dynamodb.endpoint');

    console.log('=== DYNAMODB CONFIG ===');
    console.log('region:', region);
    console.log('endpoint:', endpoint);
    console.log('========================');

    const clientConfig: {
      region: string;
      endpoint?: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
    } = { region };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
      clientConfig.credentials = {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      };
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
