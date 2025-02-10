import { UserType } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey: string;
}

export class SigninDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GenerateProductKeyDTO {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
