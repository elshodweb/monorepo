import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '@monorepo/crypto';

@Injectable()
export class TabletSignatureGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const tabletId = request.headers['x-tablet-id'] as string;
    const timestamp = request.headers['x-timestamp'] as string;
    const signature = request.headers['x-signature'] as string;

    if (!tabletId || !timestamp || !signature) {
      throw new BadRequestException('Missing required headers: X-Tablet-Id, X-Timestamp, X-Signature');
    }

    const timestampNum = parseInt(timestamp, 10);
    if (isNaN(timestampNum)) {
      throw new BadRequestException('Invalid timestamp format');
    }

    const now = Date.now();
    const drift = Math.abs(now - timestampNum);
    const maxDrift = 5 * 60 * 1000;

    if (drift > maxDrift) {
      throw new UnauthorizedException('Request timestamp is too old or too far in the future');
    }

    const tablet = await this.prisma.tablet.findUnique({
      where: { tabletId },
    });

    if (!tablet || !tablet.isActivated || !tablet.publicKey) {
      throw new UnauthorizedException('Tablet not found or not activated');
    }

    const method = request.method.toUpperCase();
    const path = request.path;
    const body = request.body ? JSON.stringify(request.body) : '';
    const payload = `${method}${path}${body}${timestamp}`;

    const isValid = CryptoService.verify(payload, signature, tablet.publicKey);

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
