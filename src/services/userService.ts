import { PrismaClient } from '@prisma/client';
import {
  generateToken,
  encodeUserId,
  decodeUserId,
} from '../utils/tokenUtility';
import bcrypt from 'bcryptjs';
import crypto, { hash } from 'crypto';

const prisma = new PrismaClient();
const SALT_DIGITS = 10;


export const registerUser = async (
  email: string,
  password: string,
  fullName?: string,
): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, SALT_DIGITS);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
  });

  return generateToken(user.id);
};


export const loginUser = async (
  email: string,
  password: string,
): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('User Not Found');
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error('Invalid Password');

  return generateToken(user.id);
};


export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  // Generate a secure reset token using crypto
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store the reset token in the database
  await prisma.user.update({
    where: { email },
    data: { resetToken },
  });

  const encodedUserId = encodeUserId(user.id);

  return {
    resetLink: `/api/auth/update-password/${resetToken}/${encodedUserId}`,
  };
};


export const updatePassword = async (
  encodedUserId: string,
  resetToken: string,
  newPassword: string,
) => {
  const userId = decodeUserId(encodedUserId); // Decode the userId from the link

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (user.resetToken !== resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_DIGITS); 

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null, // Clear the reset token after a successful password update
    },
  });

  return { message: 'Password updated successfully' };
};