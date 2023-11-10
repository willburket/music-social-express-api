// routes/userRoutes.ts
import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

// Define routes and map them to controller methods

router.get('/users/:username', UserController.getUser);

// Other routes for creating, updating, and deleting users...

export default router;