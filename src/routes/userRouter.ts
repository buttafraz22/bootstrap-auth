import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.post('/reset-password', userController.generateResetToken);
router.post('/update-password/:resetToken/:userId', userController.updatePassword);

export default router;
