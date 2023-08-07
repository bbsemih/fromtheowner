import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { LogService } from 'src/logger/logger.service';
import { LogLevelEnum, LogTypeEnum } from 'src/logger/logger.interface';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private readonly logger: LogService) {}

  async signup(user: CreateUserDto) {
    const userExists = await this.usersService.find(user.email);
    if (userExists.length) {
      this.logger.warn(`Email in use: ${user.email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(user.password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');
    const newUser = await this.usersService.create(user.email, result);

    this.logger.info(`New user signed up: ${newUser.email}`, 'AuthService', LogLevelEnum.INFO, 'auth.service.ts', LogTypeEnum.SERVICE);
    return newUser;
  }

  async signin(user: LoginDto) {
    const [existingUser] = await this.usersService.find(user.email);
    if (!existingUser) {
      this.logger.warn(`User not found for email: ${user.email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new NotFoundException('user not found!');
    };

    const [salt, storedHash] = existingUser.password.split('.');
    const hash = (await scrypt(user.password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      this.logger.warn(`Invalid credentials for email: ${user.email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new BadRequestException('invalid credentials');
    }

    this.logger.info(`User signed in: ${existingUser.email}`, 'AuthService', LogLevelEnum.INFO, 'auth.service.ts', LogTypeEnum.SERVICE);
    return user;
  }
};
