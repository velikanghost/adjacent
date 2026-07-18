import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Gates write endpoints behind a shared admin key sent as `x-admin-key`.
 * Simple role guard for the admin campaign page (no user-auth system yet).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-admin-key'];
    const expected = this.config.get<string>('ADMIN_API_KEY');

    if (!expected) {
      throw new UnauthorizedException('Admin access is not configured');
    }
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid or missing admin key');
    }
    return true;
  }
}
