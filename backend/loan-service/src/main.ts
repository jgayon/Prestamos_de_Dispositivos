import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('LoanService');

  // Crear servidor HTTP
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Conectar microservicio TCP para comunicación inter-servicios
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.LOAN_SERVICE_HOST || '0.0.0.0',
      port: parseInt(process.env.LOAN_SERVICE_RPC_PORT || '3011'),
    },
  });

  // Iniciar ambos
  await app.startAllMicroservices();
  const port = parseInt(process.env.LOAN_SERVICE_PORT || '3001');
  await app.listen(port);

  logger.log(`🚀 Loan Service HTTP listening on port ${port}`);
  logger.log(`🚀 Loan Service RPC (TCP) listening on port ${process.env.LOAN_SERVICE_RPC_PORT || 3011}`);
}
bootstrap();
