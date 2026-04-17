import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GeneratePayrollDto } from './dtos/generate-payroll.dto';
import { PayrollService } from './payroll.service';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('generate')
  generate(@Body() generatePayrollDto: GeneratePayrollDto) {
    return this.payrollService.generate(generatePayrollDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('summary')
  getSummary(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.payrollService.getSummary(month, year);
  }

  @Get('me')
  getMyPayroll(
    @CurrentEmployee() employee: JwtPayload,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.payrollService.getMyPayroll(employee.sub, month, year);
  }
}
