import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ! Remueve todo lo que esta incluido en los dto's
      forbidNonWhitelisted: true, // ! retorna bad request si hay propppppiedades en el objeto no requeridas
    })
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
