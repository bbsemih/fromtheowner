import { Module } from '@nestjs/common';
import { LogService } from './logger.service';

@Module({
  imports: [LogService],
  exports: [LogService],
})
export class LoggerModule {}
