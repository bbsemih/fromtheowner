import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { Logger } from "@nestjs/common";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(email: string, password: string) {
        const user = await this.usersService.find(email);
        if (user.length) {
            Logger.warn(`Email in use: ${email}`);
            throw new BadRequestException('email in use');
        };

        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        const result = salt + '.' + hash.toString('hex');
        const newUser = await this.usersService.create(email, result);

        Logger.log(`New user signed up: ${newUser.email}`);
        return newUser;
    };  

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user) {
            Logger.warn(`User not found for email: ${email}`);
            throw new NotFoundException('user not found!')
        };

        const [salt, storedHash] = user.password.split('.');
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (storedHash !== hash.toString('hex')) {
            Logger.warn(`Invalid credentials for email: ${email}`);
            throw new BadRequestException('invalid credentials');
        }

        Logger.log(`User signed in: ${user.email}`);
        return user;
    };
};