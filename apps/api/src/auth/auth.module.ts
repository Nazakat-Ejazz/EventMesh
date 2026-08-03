import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoService } from './cognito.service';
import { CognitoAuthGuard } from './cognito-auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [CognitoService, CognitoAuthGuard],
  exports: [CognitoService, CognitoAuthGuard],
})
export class AuthModule {}
