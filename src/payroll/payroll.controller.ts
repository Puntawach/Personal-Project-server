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
import { LockPayrollDto } from './dtos/lock-payroll.dto';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Public()
  @Post('generate')
  generate(@Body() generatePayrollDto: GeneratePayrollDto) {
    return this.payrollService.generate(generatePayrollDto);
  }
  @Public()
  @Post('lock')
  lock(@Body() lockPayrollDto: LockPayrollDto) {
    return this.payrollService.lock(lockPayrollDto);
  }
  @Public()
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
