import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { CryptoService } from '@monorepo/crypto';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpClientService {
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    const cloudApiUrl = process.env.CLOUD_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: cloudApiUrl,
    });

    this.client.interceptors.request.use((config) => {
      const serverId = this.configService.getServerId();
      const privateKey = this.configService.getPrivateKey();

      if (serverId && privateKey) {
        const timestamp = Date.now().toString();
        const method = (config.method || 'GET').toUpperCase();
        const path = config.url || '';
        const body = config.data ? JSON.stringify(config.data) : '';
        const payload = `${method}${path}${body}${timestamp}`;
        const signature = CryptoService.sign(payload, privateKey);

        config.headers['X-Server-Id'] = serverId;
        config.headers['X-Timestamp'] = timestamp;
        config.headers['X-Signature'] = signature;
      }

      return config;
    });
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}
