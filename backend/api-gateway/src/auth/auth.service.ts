import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private getLoanServiceUrl(): string {
    if (process.env.LOAN_SERVICE_HTTP_URL) {
      return process.env.LOAN_SERVICE_HTTP_URL.replace(/\/$/, '');
    }
    const host = process.env.LOAN_SERVICE_HOST || 'localhost';
    const port = process.env.LOAN_SERVICE_PORT || '3001';
    return `http://${host}:${port}`;
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const url = `${this.getLoanServiceUrl()}/users/auth/validate`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.error('Loan service HTTP unreachable:', err);
      throw new UnauthorizedException(
        'No se puede conectar al Loan Service. Ejecuta: cd backend/loan-service && npm run start:dev',
      );
    }

    if (response.status === 401) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!response.ok) {
      const body = await response.text();
      console.error('Validate credentials failed:', response.status, body);
      throw new UnauthorizedException('Error al validar credenciales');
    }

    const user = (await response.json()) as AuthUser;
    if (!user?.id) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  async login(user: AuthUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      expiresIn: '24h',
    });

    return {
      success: true,
      access_token: token,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
