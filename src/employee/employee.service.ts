import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { Employee } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaErrorMeta } from 'src/auth/types/error.type';
import { EmployeeWithoutPassword } from './types/employee.type';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { UpdateMeDto } from './dtos/update-me.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<void> {
    await this.create({ ...createAdminDto, role: 'ADMIN' });
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const hashedPassword = await this.bcrypt.hash(createEmployeeDto.password);

    try {
      const employee = await this.prisma.employee.create({
        data: { ...createEmployeeDto, password: hashedPassword },
      });
      return employee;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const meta = error.meta as PrismaErrorMeta;

        const fields: string[] =
          meta?.driverAdapterError?.cause?.constraint?.fields ??
          meta?.target ??
          [];

        if (fields.includes('email')) {
          throw new ConflictException({
            message: `Email ${createEmployeeDto.email} is already in use`,
            code: 'EMAIL_ALREADY_EXIST',
          });
        }

        if (fields.includes('identification_id')) {
          throw new ConflictException({
            message: `Identification ID ${createEmployeeDto.identificationId} is already in use`,
            code: 'IDENTIFICATION_ID_ALREADY_EXIST',
          });
        }

        throw new ConflictException({
          message: `A record with this ${fields.join(', ')} already exists`,
          code: 'DUPLICATE_FIELD',
        });
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { email, status: 'ACTIVE' },
    });
  }

  async findById(id: string): Promise<EmployeeWithoutPassword> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, status: 'ACTIVE' },
      omit: { password: true },
    });
    if (!employee)
      throw new NotFoundException({
        message: 'Not found Employee from provided ID',
        code: 'EMPLOYEE_NOT_FOUND',
      });

    return employee;
  }

  async getAllEmployee(): Promise<Employee[]> {
    const data = this.prisma.employee.findMany({ where: { status: 'ACTIVE' } });
    return data;
  }

  async updateMe(
    employeeId: string,
    UpdateMeDto: UpdateMeDto,
  ): Promise<EmployeeWithoutPassword> {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: UpdateMeDto,
    });
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }
  //
  async update(
    id: string,
    updateEmployee: UpdateEmployeeDto,
  ): Promise<EmployeeWithoutPassword> {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployee,
      omit: { password: true },
    });
  }

  async uploadAvatar(
    file: Express.Multer.File,
    employeeId: string,
  ): Promise<string> {
    // 1. upload to cloud
    const result = await this.cloudinaryService.upload(file);
    const employee = await this.update(employeeId, {
      avatarUrl: result.secure_url,
    });
    console.log(employee);
    // 2. update avatarUrl into the dat abase
    return result.secure_url;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { status: 'DELETE' },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }
}
