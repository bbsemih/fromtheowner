import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { ConfigModule,ConfigService } from '@nestjs/config';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:`.env.${process.env.NODE_ENV}`
    }),
    //Set up this to adapto to different environments
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory: (config:ConfigService) => {
        return {
          type:'sqlite',
          database: config.get<string>('DB_NAME'),
          synchronize:true,
          entities:[User,Report]
        }
      }
    }),
    UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService,
  {
    provide:APP_PIPE,
    //Whenever we create instance of Appmodule, automatically make use of this pipe globally. Implement it to every request.
    //This need emerged from the server error that i got while i was implementing integration test
    useValue: new ValidationPipe({
      whitelist:true,
    })
  }
  ],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer) {
    consumer.apply(cookieSession({
      keys: ['asdfsdf'],
    })).forRoutes('*');
  }
};
