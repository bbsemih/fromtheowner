import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, Post, Session } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() user: CreateUserDto, @Session() session: { userId: number; admin: boolean; userEmail: string }) {
    const data = await this.authService.signup(user);
    session.userId = data.id;
    session.admin = data.admin;
    session.userEmail = data.email;
    return user;
  }

  @Post('signout')
  @HttpCode(200)
  signout(@Session() session: { userId: number; admin: boolean; userEmail: string }) {
    session.userId = null;
    session.admin = null;
    session.userEmail = null;
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() body: LoginDto, @Session() session: { userId: number; admin: boolean; userEmail: string }) {
    const user = await this.authService.signin(body);
    session.userEmail = user.email;
    //TODO: user.id doesnt work somehow
    return user;
  }
};
