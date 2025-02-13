import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';

export const Roles = (...roles: UserType[]) => {
  return SetMetadata('roles', roles);
};
