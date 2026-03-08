import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  getAllEmployee() {}

  @Get()
  getEmployeeById() {}

  @Get()
  getMe() {}

  @Post()
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Patch()
  updateMe() {}

  @Patch()
  updateEmployee() {}
}
