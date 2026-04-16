import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { UpdateMeDto } from './dtos/update-me.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('me')
  getMe(@CurrentEmployee() employee: JwtPayload) {
    return this.employeeService.findById(employee.sub);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  getEmployeeById(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  getAllEmployee() {
    return this.employeeService.getAllEmployee();
  }

  @Roles('SUPER_ADMIN')
  @ResponseMessage('Admin created successfully')
  @Post('admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<void> {
    return await this.employeeService.createAdmin(createAdminDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentEmployee() employee: JwtPayload,
  ): Promise<string> {
    return this.employeeService.uploadAvatar(file, employee.sub);
  }

  @Patch('me')
  updateMe(
    @Body() updateMeDto: UpdateMeDto,
    @CurrentEmployee() employee: JwtPayload,
  ) {
    return this.employeeService.updateMe(employee.sub, updateMeDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.employeeService.restore(id);
  }
}
