import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { LogService } from 'src/logger/logger.service';
import { LogLevelEnum, LogTypeEnum } from 'src/logger/logger.interface';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>, private readonly logger: LogService) {}
  async create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    try {
      const newUser = await this.repo.save(user);
      this.logger.info(`new user created: ${newUser.email}`, 'UsersService', LogLevelEnum.INFO, 'users.service.ts', LogTypeEnum.SERVICE);
      return newUser;
    } catch (err) {
      this.logger.error(`Error creating user: ${err.message}`, 'UsersService', LogLevelEnum.ERROR, 'users.service.ts', LogTypeEnum.SERVICE);
      throw err;
    }
  }

  async findOne(id: number) {
    if (!id) {
      return null;
    }
    try {
      //findOne(id) is changed to findOne({where: {id}}) in typeorm
      const user = await this.repo.findOne({ where: { id } });
      if (user) {
        this.logger.info(`user found: ${user.email}`, 'UsersService', LogLevelEnum.INFO, 'users.service.ts', LogTypeEnum.SERVICE);
      } else {
        this.logger.warn(`user with id:${id} is not found!`, 'UsersService', LogLevelEnum.WARN, 'users.service.ts', LogTypeEnum.SERVICE);
      }
      return user;
    } catch (err) {
      this.logger.error(`Error finding user: ${err.message}`, 'UsersService', LogLevelEnum.ERROR, 'users.service.ts', LogTypeEnum.SERVICE);
      throw err;
    }
  }

  async find(email: string) {
    try {
      const users = await this.repo.find({ where: { email } });
      this.logger.info(`Found ${users.length} user(s) with email: ${email}`, 'UsersService', LogLevelEnum.INFO, 'users.service.ts', LogTypeEnum.SERVICE);
      return users;
    } catch (err) {
      this.logger.error(`Error finding user: ${err.message}`, 'UsersService', LogLevelEnum.ERROR, 'users.service.ts', LogTypeEnum.SERVICE);
      throw err;
    }
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      this.logger.warn(`user with id:${id} is not found!`, 'UsersService', LogLevelEnum.WARN, 'users.service.ts', LogTypeEnum.SERVICE);
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    try {
      const updatedUser = await this.repo.save(user);
      this.logger.info(`User updated: ${updatedUser.email}`, 'UsersService', LogLevelEnum.INFO, 'users.service.ts', LogTypeEnum.SERVICE);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, 'UsersService', LogLevelEnum.ERROR, 'users.service.ts', LogTypeEnum.SERVICE);
      throw error;
    }
  }

  async remove(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      this.logger.warn(`user with id:${id} is not found!`, 'UsersService', LogLevelEnum.WARN, 'users.service.ts', LogTypeEnum.SERVICE);
      throw new NotFoundException('user not found');
    }

    try {
      await this.repo.remove(user);
      this.logger.info(`User deleted: ${user.email}`, 'UsersService', LogLevelEnum.INFO, 'users.service.ts', LogTypeEnum.SERVICE);
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, 'UsersService', LogLevelEnum.ERROR, 'users.service.ts', LogTypeEnum.SERVICE);
      throw error;
    }
  }
}
