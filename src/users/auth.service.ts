import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { LogService } from 'src/logger/logger.service';
import { LogLevelEnum, LogTypeEnum } from 'src/logger/logger.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private readonly logger: LogService) {}

  async signup(email: string, password: string) {
    const user = await this.usersService.find(email);
    if (user.length) {
      this.logger.warn(`Email in use: ${email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');
    const newUser = await this.usersService.create(email, result);

    this.logger.info(`New user signed up: ${newUser.email}`, 'AuthService', LogLevelEnum.INFO, 'auth.service.ts', LogTypeEnum.SERVICE);
    return newUser;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      this.logger.warn(`User not found for email: ${email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new NotFoundException('user not found!');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      this.logger.warn(`Invalid credentials for email: ${email}`, 'AuthService', LogLevelEnum.WARN, 'auth.service.ts', LogTypeEnum.SERVICE);
      throw new BadRequestException('invalid credentials');
    }

    this.logger.info(`User signed in: ${user.email}`, 'AuthService', LogLevelEnum.INFO, 'auth.service.ts', LogTypeEnum.SERVICE);
    return user;
  }
}
