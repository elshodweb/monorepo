import * as crypto from 'crypto';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class CryptoService {
  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return {
      publicKey,
      privateKey,
    };
  }

  static sign(payload: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  static verify(payload: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(payload);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }

  static hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  static compareHash(secret: string, hash: string): boolean {
    const secretHash = this.hashSecret(secret);
    return crypto.timingSafeEqual(
      Buffer.from(secretHash),
      Buffer.from(hash)
    );
  }

  static generateOTP(length: number = 8): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  }
}
