import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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

  @Get()
  getAllEmployee() {}

  // @Post('admin')
  // async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<string> {
  //   await this.employeeService.createAdmin(createAdminDto);
  //   return 'Admin created successfully';
  // }
  // @Public()
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

  @Patch()
  updateMe() {}

  @Patch()
  updateEmployee() {}
}
