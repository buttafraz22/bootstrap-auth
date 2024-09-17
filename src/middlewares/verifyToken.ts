import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  resetToken?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}


export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Authentication token missing' });

  try {
    // Decode the JWT token
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Find the user by ID (assuming your JWT contains the userId)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach the custom user object to the request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName!,
      resetToken: user.resetToken!,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
