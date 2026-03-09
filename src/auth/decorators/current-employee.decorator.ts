import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';

export const CurrentEmployee = createParamDecorator(
  (data: keyof JwtPayload, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const employee = request.employee;
    if (!employee)
      throw new Error('current cannot be userd without authenication');

    return data ? employee[data] : employee;
  },
);
