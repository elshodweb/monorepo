import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto, ActivateRestaurantDto } from '@monorepo/shared-types';
import { CryptoService } from '@monorepo/crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    const activationSecret = CryptoService.generateOTP(16);
    const activationSecretHash = CryptoService.hashSecret(activationSecret);

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: createRestaurantDto.name,
        address: createRestaurantDto.address,
        activationSecretHash,
        isActivated: false,
      },
    });

    return {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      activation_secret: activationSecret,
      message: 'Restaurant created. Save the activation_secret - it will not be shown again.',
    };
  }

  async activate(activateRestaurantDto: ActivateRestaurantDto) {
    const hash = CryptoService.hashSecret(activateRestaurantDto.activation_secret);

    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        activationSecretHash: hash,
        isActivated: false,
      },
    });

    if (!restaurant) {
      throw new UnauthorizedException('Invalid activation secret or restaurant already activated');
    }

    const serverId = uuidv4();

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        publicKey: activateRestaurantDto.public_key,
        serverId,
        isActivated: true,
        activationSecretHash: null,
      },
    });

    return {
      server_id: updated.serverId,
      message: 'Restaurant activated successfully',
    };
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        isActivated: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        isActivated: true,
        createdAt: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }
}
