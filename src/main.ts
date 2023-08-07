import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    //allow only warn and error types to only see critical log information in production
    //logger: process.env.NODE_ENV == 'development' ? ['log', 'debug', 'verbose', 'error','warn'] : ['error', 'warn']
  });
  app.setGlobalPrefix('v1/api');
  //warn logs dont necessarily mean that there is an error, it is just a warning compared to error logs
  const config = new DocumentBuilder()
    .setTitle('fromtheowner')
    .setDescription("API Documentation of 'fromtheowner' application")
    .setVersion('1.0.0')
    .addTag('api', 'swagger')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  
  if (process.env.CORS_ENABLE) {
    app.enableCors({
      origin: origin.length === 0 ? '*' : origin,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      //will add more options
    });
  } else {
    app.enableCors();
  }

  await app.listen(3000);
}
bootstrap();
