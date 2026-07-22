import { Module } from '@nestjs/common';
import { DynamoDBClientProvider } from './dynamodb-client.provider';

@Module({
  providers: [DynamoDBClientProvider],
  exports: [DynamoDBClientProvider],
})
export class CommonModule {}
