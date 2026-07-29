import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class CognitoService {
  private jwksClient: JwksClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    const userPoolId = this.configService.getOrThrow<string>(
      'COGNITO_USER_POOL_ID',
    );

    this.jwksClient = new JwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true, // Avoid fetching keys on every request (~50ms saved)
      cacheMaxEntries: 5, // Cognito rotates keys slowly; 5 is plenty
      rateLimit: true, // Defensive: don't flood Cognito if cache expires
      jwksRequestsPerMinute: 10,
    });
  }

  async verifyToken(token: string): Promise<CognitoJwtPayload> {
    try {
      // Step 1: Decode header only (no verification) to grab the Key ID
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded?.header?.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Step 2: Fetch the matching public key from JWKS
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      // Step 3: Verify signature + expiry + issuer + audience
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'], // Explicit whitelist. Prevents "algorithm confusion" attacks
        issuer: `https://cognito-idp.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.configService.get('COGNITO_USER_POOL_ID')}`,
        audience: this.configService.getOrThrow<string>('COGNITO_CLIENT_ID'),
      }) as CognitoJwtPayload;

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

export interface CognitoJwtPayload {
  sub: string; // Cognito UUID — unique, permanent user identifier
  email: string;
  'custom:role'?: string; // We'll configure this custom attribute in Cognito later
  exp: number; // Unix timestamp — token expiry
  iat: number; // Unix timestamp — issued at
}
