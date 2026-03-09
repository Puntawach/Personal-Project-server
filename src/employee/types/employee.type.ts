import { Employee } from 'src/database/generated/prisma/client';

export type EmployeeWithoutPassword = Omit<Employee, 'password'>;
