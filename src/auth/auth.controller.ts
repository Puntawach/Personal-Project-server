import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login } from './dtos/login.dto';
import { Employee } from 'src/database/generated/prisma/client';
import { Public } from './decorators/public.decorator';
import { CurrentEmployee } from './decorators/current-employee.decorator';
import type { JwtPayload } from './types/jwt-payload.type';
import { EmployeeWithoutPassword } from 'src/employee/types/employee.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ResponseMessage('Login Successfully')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Body() loginDto: Login,
  ): Promise<{ accessToken: string; employee: EmployeeWithoutPassword }> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getCurrentEmployee(
    @CurrentEmployee() employee: JwtPayload,
  ): Promise<EmployeeWithoutPassword> {
    return this.authService.getCurrentUser(employee.sub);
  }
}
