import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

import { SigninDTO, SignupDTO, GenerateProductKeyDTO } from 'src/dtos/auth.dto';
import { UserType } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:userType')
  async signup(
    @Body() body: SignupDTO,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType != UserType.BUYER) {
      if (!body.productKey) throw new UnauthorizedException();
      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );
      if (!isValidProductKey) throw new UnauthorizedException();
    }
    return this.authService.signup(body, userType);
  }

  @Post('signin')
  signin(@Body() body: SigninDTO) {
    return this.authService.signin(body);
  }

  @Post('key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDTO) {
    return this.authService.generateProductKey(email, userType);
  }
}
