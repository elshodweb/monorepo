import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTabletDto, ActivateTabletDto } from '@monorepo/shared-types';
import { CryptoService } from '@monorepo/crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TabletsService {
  constructor(private prisma: PrismaService) {}

  async create(createTabletDto: CreateTabletDto) {
    const activationCode = CryptoService.generateOTP(8);
    const activationCodeHash = CryptoService.hashSecret(activationCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const tablet = await this.prisma.tablet.create({
      data: {
        name: createTabletDto.name,
        tabletId: uuidv4(),
        activationCodeHash,
        activationCodeExpiresAt: expiresAt,
        isActivated: false,
      },
    });

    return {
      id: tablet.id,
      tablet_id: tablet.tabletId,
      name: tablet.name,
      activation_code: activationCode,
      expires_at: expiresAt.toISOString(),
      message: 'Tablet created. Activation code expires in 10 minutes.',
    };
  }

  async activate(activateTabletDto: ActivateTabletDto) {
    const hash = CryptoService.hashSecret(activateTabletDto.activation_code);
    const now = new Date();

    const tablet = await this.prisma.tablet.findFirst({
      where: {
        activationCodeHash: hash,
        isActivated: false,
      },
    });

    if (!tablet) {
      throw new UnauthorizedException('Invalid activation code or tablet already activated');
    }

    if (!tablet.activationCodeExpiresAt || tablet.activationCodeExpiresAt < now) {
      throw new UnauthorizedException('Activation code has expired');
    }

    const updated = await this.prisma.tablet.update({
      where: { id: tablet.id },
      data: {
        publicKey: activateTabletDto.public_key,
        isActivated: true,
        activationCodeHash: null,
        activationCodeExpiresAt: null,
      },
    });

    return {
      tablet_id: updated.tabletId,
      message: 'Tablet activated successfully',
    };
  }

  async findAll() {
    return this.prisma.tablet.findMany({
      select: {
        id: true,
        tabletId: true,
        name: true,
        isActivated: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const tablet = await this.prisma.tablet.findUnique({
      where: { id },
      select: {
        id: true,
        tabletId: true,
        name: true,
        isActivated: true,
        createdAt: true,
      },
    });

    if (!tablet) {
      throw new NotFoundException('Tablet not found');
    }

    return tablet;
  }
}
