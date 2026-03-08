import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { Employee } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { PrismaClientKnownRequestError } from 'src/database/generated/prisma/internal/prismaNamespace';
import { PrismaErrorMeta } from 'src/auth/types/error.type';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcrypt: BcryptService,
  ) {}

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
    return this.prisma.employee.findUnique({ where: { email } });
  }
}
