import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('DeviceService');

  // Crear servidor HTTP para acceso directo
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Conectar microservicio TCP para comunicación inter-servicios
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.DEVICE_SERVICE_HOST || '0.0.0.0',
      port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
    },
  });

  // Iniciar ambos (HTTP + TCP)
  await app.startAllMicroservices();
  const httpPort = parseInt(process.env.DEVICE_SERVICE_HTTP_PORT || '3002');
  await app.listen(httpPort);

  const tcpPort = parseInt(process.env.DEVICE_SERVICE_PORT || '3002');
  logger.log(`✅ Device Service HTTP listening on port ${httpPort}`);
  logger.log(`📡 Device Service RPC (TCP) listening on port ${tcpPort}`);
  logger.log(`✅ CORS enabled for origin: ${process.env.CORS_ORIGIN || '*'}`);
}
bootstrap();