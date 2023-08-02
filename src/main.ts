import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //TODO: set different logging level based on environment
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    //allow only warn and error types to only see critical log information in production
    //logger: process.env.NODE_ENV == 'development' ? ['log', 'debug', 'verbose', 'error','warn'] : ['error', 'warn']
  });
  //warn logs dont necessarily mean that there is an error, it is just a warning compared to error logs
  const config = new DocumentBuilder()
    .setTitle('fromtheowner')
    .setDescription("API Documentation of 'fromtheowner' application")
    .setVersion('1.0.0')
    .addTag('api','swagger')
    .build();

    const document = SwaggerModule.createDocument(app,config)
    SwaggerModule.setup('api',app,document)

  app.enableCors();
  await app.listen(3000);
};
bootstrap();
