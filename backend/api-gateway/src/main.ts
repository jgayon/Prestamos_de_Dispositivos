import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('APIGateway');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = parseInt(process.env.GATEWAY_PORT || '3000');
  await app.listen(port);

  const loanServiceUrl = `${process.env.LOAN_SERVICE_HOST || 'localhost'}:${process.env.LOAN_SERVICE_PORT || 3001}`;
  const deviceServiceUrl = `${process.env.DEVICE_SERVICE_HOST || 'localhost'}:${process.env.DEVICE_SERVICE_PORT || 3002}`;

  logger.log(`✅ API Gateway is running on http://localhost:${port}`);
  logger.log(`🔗 Connected to Loan Service at ${loanServiceUrl}`);
  logger.log(`🔗 Connected to Device Service at ${deviceServiceUrl}`);
}

bootstrap().catch(err => {
  console.error('Failed to start API Gateway:', err);
  process.exit(1);
});
