import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Logger } from '@nestjs/common';
import { LogService } from 'src/logger/logger.service';


@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>, private readonly logger: LogService) {}
    async create(email: string, password: string) {
        const user = this.repo.create({ email, password });
        try {
            const newUser = await this.repo.save(user);
            //this.logger.info(`new user created: ${newUser.email}`, 'UsersService', 'info', 'users.service.ts', 'service');
            Logger.log(`new user created: ${newUser.email}`);
            return newUser;
        }
        catch (err) {
            Logger.error(`Error creating user: ${err.message}`);
            throw err;
        };
    };

    async findOne(id: number) {
        if (!id) {
            return null;
        }
        try {
            //findOne(id) is changed to findOne({where: {id}}) in typeorm
            const user = await this.repo.findOne({where: {id}});
            if(user) {
                Logger.log(`user found: ${user.email}`);
            } else {
                Logger.warn(`user with id:${id} is not found!`);
            }
            return user;
        } catch(err) {
            Logger.error(`Error finding user: ${err.message}`);
            throw err;
        };
    };

    async find(email: string) {
        try {
            const users = await this.repo.find({where: {email}});
            Logger.log(`Found ${users.length} user(s) with email: ${email}`);
            return users;
        } catch(err) {
            Logger.error(`Error finding user: ${err.message}`);
            throw err;
        };
    };

    async update(id: number, attrs: Partial<User>) {
        const user = await this.repo.findOneBy({id});
        if (!user) {
            Logger.warn(`user with id:${id} is not found!`);
            throw new NotFoundException('user not found');
        };
        Object.assign(user, attrs);
        try {
            const updatedUser = await this.repo.save(user);
            Logger.log(`User updated: ${updatedUser.email}`);
            return updatedUser;
        } catch (error) {
            Logger.error(`Error updating user: ${error.message}`);
            throw error;
        }
    };

    async remove(id: number) {
        const user = await this.repo.findOneBy({id});
        if (!user) {
            Logger.warn(`user with id:${id} is not found!`);
            throw new NotFoundException('user not found');
        };

        try {
            await this.repo.remove(user);
            Logger.log(`User deleted: ${user.email}`);
        } catch (error) {
            Logger.error(`Error deleting user: ${error.message}`);
            throw error;
        };
    };
};