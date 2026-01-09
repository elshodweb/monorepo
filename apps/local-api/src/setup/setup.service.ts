import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { SetupLocalApiDto } from '@monorepo/shared-types';
import { CryptoService } from '@monorepo/crypto';
import axios from 'axios';

@Injectable()
export class SetupService {
  private readonly cloudApiUrl = process.env.CLOUD_API_URL || 'http://localhost:3000';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async setup(setupDto: SetupLocalApiDto) {
    const existingServerId = this.configService.getServerId();
    if (existingServerId) {
      throw new BadRequestException('Server is already activated');
    }

    const keyPair = CryptoService.generateKeyPair();

    try {
      const response = await axios.post(
        `${this.cloudApiUrl}/api/restaurants/activate`,
        {
          activation_secret: setupDto.activation_secret,
          public_key: keyPair.publicKey,
        },
      );

      const serverId = response.data.server_id;

      await this.prisma.server.create({
        data: {
          serverId,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
          isActivated: true,
        },
      });

      this.configService.saveConfig(serverId, keyPair.publicKey, keyPair.privateKey);

      return {
        server_id: serverId,
        message: 'Local API activated successfully',
      };
    } catch (error: any) {
      if (error.response) {
        throw new BadRequestException(error.response.data.message || 'Activation failed');
      }
      throw new BadRequestException('Failed to connect to Cloud API');
    }
  }
}
