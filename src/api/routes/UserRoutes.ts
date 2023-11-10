import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

// Define routes and map them to controller methods

router.get('/users/:username', UserController.getUser);
router.post('/auth', UserController.authorizeUser);

export default router;