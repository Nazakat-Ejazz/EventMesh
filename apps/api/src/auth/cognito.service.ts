import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtPayload } from '@eventmesh/shared-types';

@Injectable()
export class CognitoService {
  private jwtsClient: JwksClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    const userPoolId = this.configService.getOrThrow<string>(
      'COGNITO_USER_POOL_ID',
    );

    this.jwtsClient = new JwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  async verifyToken(token: string): Promise<CognitoJwtPayload> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded?.header.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      const key = await this.jwtsClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: `https://cognito-idp.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.configService.get('COGNITO_USER_POOL_ID')}`,
        audience: this.configService.getOrThrow<string>('COGNITO_CLIENT_ID'),
      }) as CognitoJwtPayload;

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
