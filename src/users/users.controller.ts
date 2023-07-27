import { UseGuards,Body,Controller,Post, Get, Patch, Param, Query, Delete, NotFoundException, Session} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize} from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
        ) {}        

    @Post('/signout')
    signout(@Session() session: any) {
        session.userId = null;
    }

    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        const { email, password } = body;
        const user = await this.authService.signup(email, password);
        session.userId = user.id;
        return user;
    };

    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        const { email, password } = body;
        const user = await this.authService.signin(email, password);
        session.userId = user.id;     
        return user; 
    };

    @Serialize(UserDto)
    @Get('/:id')
    async findUser(@Param('id') id: string) {
        console.log('Handler is running');
        const user = await this.usersService.findOne(parseInt(id));
        if (!user) {
            throw new NotFoundException('user not found');
        }
        return user;
    };

    @Get()
    findAllUsers(@Query('email') email: string) {
        return this.usersService.find(email);
    };

    @Delete('/:id')
    @UseGuards(AuthGuard)
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(parseInt(id));
    };

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(parseInt(id), body);
    }
};
