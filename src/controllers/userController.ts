import { Request, Response } from 'express';
import * as userService from '../services/userService';


export const registerUser = async (req: Request, res: Response): Promise<object> => {
  try {
    const { email, password, fullName } = req.body;
    const token = await userService.registerUser(email, password, fullName);
    return res.status(201).json({ token });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


export const loginUser = async (req: Request, res: Response): Promise<object> => {
  try {
    const { email, password } = req.body;
    const token = await userService.loginUser(email, password);
    return res.status(200).json({ token });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


export const generateResetToken = async (req: Request, res: Response): Promise<object> => {
  try {
    const { email } = req.body;
    const { resetLink } = await userService.generateResetToken(email);
    return res.status(200).json({ resetLink });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


export const updatePassword = async (req: Request, res: Response): Promise<object> => {
  try {
    const { newPassword } = req.body;
    const { resetToken, userId } = req.params; // Get encoded userId from the URL parameters

    const response = await userService.updatePassword(
      userId,
      resetToken,
      newPassword,
    );
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};