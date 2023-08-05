import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { LoggerModule } from './logger/logger.module';
import { CarsController } from './cars/cars.controller';
import * as winston from 'winston';
// eslint-disable-next-line
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    /*
    RedisModule.forRootAsync({

    })
    */
    //Set up this to adapt to different environments
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        //TODO: migrate to postgresql
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          synchronize: true,
          entities: [User, Report],
        };
      },
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(msg => {
              return `[${msg.level}] ${msg.timestamp} | ${msg.message} | class: ${msg.context.class} | filename: ${msg.context.filename} | type: ${msg.context.type}`;
            }),
          ),
        }),
      ],
    }),
    UsersModule,
    ReportsModule,
    LoggerModule,
  ],
  controllers: [AppController, CarsController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      //Whenever we create instance of Appmodule, automatically make use of this pipe globally. Implement it to every request.
      //This need emerged from the server error that i got while i was implementing integration test
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');
  }
}
