import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 *
 * @param id The userId of the user to encode jwt Token as.
 * @returns string: the jwt Token of the user.
 */
export const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_BYTES as string, 'utf-8'); 
const IV_LENGTH = 16;

// Encrypt user ID
export const encodeUserId = (userId: number): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(userId.toString()),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt user ID
export const decodeUserId = (encryptedId: string): number => {
  const textParts = encryptedId.split(':');
  if (textParts.length !== 2) {
    throw new Error('Invalid encrypted ID format');
  }

  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  const decodedId = parseInt(decrypted.toString(), 10);

  if (isNaN(decodedId)) {
    throw new Error('Invalid encrypted user ID');
  }

  return decodedId;
};