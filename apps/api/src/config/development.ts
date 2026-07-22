import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  region: process.env.AWS_REGION || 'us-east-1',

  dynamoDB: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'eventmesh-local',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  },

  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
    jwksUrl: process.env.COGNITO_JWKS_URL || '',
  },

  sqs: {
    orderQueueUrl: process.env.SQS_ORDER_QUEUE_URL || '',
    orderPaymentUrl: process.env.SQS_PAYMENT_QUEUE_URL || '',
  },
  sns: {
    orderTopicArn: process.env.SNS_ORDER_TOPIC_ARN || '',
  },
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL || 'noreply@eventmesh.dev',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publissableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  webSocket: {
    apiEndpoint: process.env.WEBSOCKET_API_ENDPOINT || '',
  },
}));
