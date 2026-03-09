import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/database/generated/prisma/enums';
import { ROLES } from '../decorators/role.decorator';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const workerRole = request.employee?.role;

    if (!workerRole) throw new Error('Role cannot use without authentication');

    if (!roles.includes(workerRole))
      throw new ForbiddenException(
        'Insufficient permission to perform this action',
      );
    return true;
  }
}
