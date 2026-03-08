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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Body() loginDto: Login,
  ): Promise<{ accessToken: string; employee: Omit<Employee, 'password'> }> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getCurrentEmployee() {}
}
