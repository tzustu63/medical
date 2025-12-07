import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from '@/common/enums';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  userType: UserType;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    if (data) {
      return user[data];
    }

    return user;
  },
);

