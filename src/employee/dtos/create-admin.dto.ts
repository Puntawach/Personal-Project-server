import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class CreateAdminDto extends OmitType(CreateEmployeeDto, ['role']) {}
