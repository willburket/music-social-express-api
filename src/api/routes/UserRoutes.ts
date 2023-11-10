import express, { Router } from 'express';
import UserController from '../controllers/UserController';

// const router = Router();

// router.use(express.json());
const router: Router = express.Router();
router.use(express.json());

router.get('/users/:username', UserController.getUser);
router.post('/auth', UserController.authorizeUser);

export default router;