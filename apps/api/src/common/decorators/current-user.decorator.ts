import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from '@eventmesh/shared-types';

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user) {
      throw new Error('CurrentUser decorator used without CognitoAuthGuard');
    }

    return data ? user[data] : user;
  },
);
