
import speakeasy from 'speakeasy';
const QRCode = require('qrcode');
import crypto from 'crypto';

export class MFA {
  static generateSecret(userEmail: string, userName: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `${userName} (${userEmail})`,
      issuer: 'VotingApp',
      length: 32
    });

    return {
      secret: secret.base32!,
      qrCodeUrl: secret.otpauth_url!
    };
  }

  static async generateQRCodeDataUrl(otpauthUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      QRCode.toDataURL(
        otpauthUrl,
        {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (err: any, url: any) => {
          if (err || !url) {
            reject(new Error('Failed to generate QR code'));
          } else {
            resolve(url);
          }
        }
      );
    });
  }

  static verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after current time
      step: 30
    });
  }

  static generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => {
      // Generate 8-character backup codes
      return crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{1,4}/g)!.join('-');
    });
  }

  static verifyBackupCode(code: string, backupCodes: string[]): { valid: boolean; remainingCodes: string[] } {
    const normalizedCode = code.toUpperCase().replace(/\\s+/g, '');
    const index = backupCodes.findIndex(backupCode => 
      backupCode.replace(/\\s+/g, '') === normalizedCode
    );
    
    if (index !== -1) {
      const remainingCodes = [...backupCodes];
      remainingCodes.splice(index, 1); // Remove used backup code
      return { valid: true, remainingCodes };
    }
    
    return { valid: false, remainingCodes: backupCodes };
  }

  static formatBackupCodes(codes: string[]): string[] {
    return codes.map(code => code.match(/.{1,4}/g)!.join('-'));
  }

  // Generate time-based one-time password for testing
  static generateTOTP(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }
}

// MFA Error handling
export class MFAError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TOKEN' | 'INVALID_BACKUP_CODE' | 'SETUP_REQUIRED' | 'ALREADY_ENABLED'
  ) {
    super(message);
    this.name = 'MFAError';
  }
}
