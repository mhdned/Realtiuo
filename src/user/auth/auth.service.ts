import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Injectable, ConflictException, HttpException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(
    { email, password, name, phone }: SignupParams,
    userType: UserType,
  ) {
    const existUser = await this.prismaService.user.findUnique({
      where: { email: email },
    });
    if (existUser) throw new ConflictException();
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        passsword: hashPassword,
        name,
        phone_number: phone,
        user_type: userType,
      },
    });

    const token = this.generateJWT(user.name, user.id);

    return token;
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });
    if (!user) throw new HttpException('Invalid crendentials', 400);

    const hashPassowrd = user.passsword;
    const isValidPassword = await bcrypt.compare(password, hashPassowrd);

    if (!isValidPassword) throw new HttpException('Invalid crendentials', 400);
    const token = this.generateJWT(user.name, user.id);
    return token;
  }

  async generateJWT(name: string, id: number) {
    return jwt.sign({ name, id }, process.env.JSON_TOKEN_KEY, {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
      algorithm: 'HS256',
    });
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }
}
