import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';
import { DevicesController } from './devices.controller';
import { LoansController } from './loans.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    // Clientes para comunicarse con microservicios CON REINTENTOS
    ClientsModule.register([
      {
        name: 'LOAN_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.LOAN_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.LOAN_SERVICE_RPC_PORT || '3011'),
          retryAttempts: 3,      // ← NUEVO: Reintentos automáticos
          retryDelay: 1000,       // ← NUEVO: Espera 1s entre reintentos
          timeout: 5000,          // ← NUEVO: Timeout 5s
        },
      },
      {
        name: 'DEVICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVICE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
          retryAttempts: 3,      // ← NUEVO: Reintentos automáticos
          retryDelay: 1000,       // ← NUEVO: Espera 1s entre reintentos
          timeout: 5000,          // ← NUEVO: Timeout 5s
        },
      },
    ]),
  ],
  controllers: [AppController, UsersController, DevicesController, LoansController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}