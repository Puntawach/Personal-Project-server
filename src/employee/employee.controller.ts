import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { ResponseMessage } from 'src/common/decorators/message-response.decorator';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { UpdateMeDto } from './dtos/update-me.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('me')
  getMe(@CurrentEmployee() employee: JwtPayload) {
    console.log(employee);
    return this.employeeService.findById(employee.sub);
  }

  @Get(':id')
  getEmployeeById(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Public()
  @Get()
  getAllEmployee() {
    return this.employeeService.getAllEmployee();
  }

  @Public()
  @ResponseMessage('Admin created successfully')
  @Post('admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<void> {
    return await this.employeeService.createAdmin(createAdminDto);
  }
  @Public()
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

  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.employeeService.restore(id);
  }
}
