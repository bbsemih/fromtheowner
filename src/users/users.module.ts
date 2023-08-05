import { CurrentUserMiddleware } from './../middlewares/current-user.middleware';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { LogService } from 'src/logger/logger.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LoggerModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService, LogService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    //will run after cookie session middleware
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
