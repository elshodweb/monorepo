import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly configPath = path.join(process.cwd(), '.local-api-config.json');

  getServerId(): string | null {
    try {
      const config = this.readConfig();
      return config.serverId || null;
    } catch {
      return null;
    }
  }

  getPrivateKey(): string | null {
    try {
      const config = this.readConfig();
      return config.privateKey || null;
    } catch {
      return null;
    }
  }

  getPublicKey(): string | null {
    try {
      const config = this.readConfig();
      return config.publicKey || null;
    } catch {
      return null;
    }
  }

  saveConfig(serverId: string, publicKey: string, privateKey: string) {
    const config = {
      serverId,
      publicKey,
      privateKey,
    };
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  private readConfig(): any {
    if (!fs.existsSync(this.configPath)) {
      return {};
    }
    const content = fs.readFileSync(this.configPath, 'utf8');
    return JSON.parse(content);
  }
}
