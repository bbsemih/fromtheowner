import { CurrentUserMiddleware } from './../middlewares/current-user.middleware';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ],
  controllers: [UsersController],
  providers: [
    UsersService, 
    AuthService, 
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    //will run after cookie session middleware
    consumer.apply(CurrentUserMiddleware).forRoutes("*");
  };
};