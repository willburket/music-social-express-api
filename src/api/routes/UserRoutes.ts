import express, { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/Authenticate';

const router: Router = express.Router();
router.use(express.json());

//user 
router.get('/users/:username', authenticateJWT, UserController.getUser);
router.post('/auth', UserController.authorizeUser);
router.post('/signup', UserController.createUser);

// follow
router.post('/follow/:id', authenticateJWT, UserController.followUser);
router.get('/follow/:id', authenticateJWT, UserController.getFollowStatus);
router.delete('/follow/:id', authenticateJWT, UserController.unfollowUser);

export default router;