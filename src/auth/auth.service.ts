import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Login } from './dtos/login.dto';
import { Employee } from 'src/database/generated/prisma/client';
import { EmployeeService } from 'src/employee/employee.service';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { AuthTokenService } from 'src/shared/security/services/auth-token.service';
import { EmployeeWithoutPassword } from 'src/employee/types/employee.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly bcryptService: BcryptService,
    private readonly authTokenService: AuthTokenService,
  ) {}
  async login(
    loginDto: Login,
  ): Promise<{ accessToken: string; employee: Omit<Employee, 'password'> }> {
    const employee = await this.employeeService.findByEmail(loginDto.email);

    if (!employee)
      throw new UnauthorizedException({
        message: 'Email or Password is incorrect',
        code: 'INVALID_CREDENTIAL',
      });

    const isMatch = await this.bcryptService.compare(
      loginDto.password,
      employee.password,
    );

    if (!isMatch)
      throw new UnauthorizedException({
        message: 'Email or Password is incorrect',
        code: 'INVALID_CREDENTIAL',
      });

    const accessToken = await this.authTokenService.sign({
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    });

    const { password, ...rest } = employee;
    return { accessToken, employee: rest };
  }

  async getCurrentUser(id: string): Promise<EmployeeWithoutPassword> {
    return await this.employeeService.findById(id);
  }
}
