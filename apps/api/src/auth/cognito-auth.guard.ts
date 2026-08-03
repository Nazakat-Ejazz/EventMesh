import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoService } from './cognito.service';
import { CurrentUserPayload, UserRole } from '@eventmesh/shared-types';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    const devToken = this.configService.get<string>('DEV_AUTH_TOKEN');

    if (isDev && devToken && token === devToken) {
      const devUser: CurrentUserPayload = {
        sub: 'dev-user-123',
        email: 'dev@eventmesh.local',
        role: UserRole.ADMIN,
      };
      request.user = devUser;
      return true;
    }

    const payload = await this.cognitoService.verifyToken(token);

    const user: CurrentUserPayload = {
      sub: payload.sub,
      email: payload.email,
      role: (payload['custom:role'] as UserRole) || UserRole.ATTENDEE,
    };
    request.user = user;

    return true;
  }
}
