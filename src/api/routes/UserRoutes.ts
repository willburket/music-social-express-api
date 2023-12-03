import express, { Router } from 'express';
import UserController from '../controllers/UserController';
import PostController from '../controllers/PostController';
import FeedController from '../controllers/FeedController';
import { authenticateJWT } from '../middlewares/Authenticate';

const router: Router = express.Router();
router.use(express.json());

//user 
router.get('/users/:username', authenticateJWT, UserController.getUser);
router.post('/auth', UserController.authorizeUser);
router.post('/signup', UserController.createUser);
router.get('/followers/:id', authenticateJWT, UserController.getFollowers);
router.get('/following/:id', authenticateJWT, UserController.getFollowing);;

// follow
router.post('/follow/:id', authenticateJWT, UserController.followUser);
router.get('/follow/:id', authenticateJWT, UserController.getFollowStatus);
router.delete('/follow/:id', authenticateJWT, UserController.unfollowUser);

//post 
router.post('/posts', authenticateJWT, PostController.createPost);
router.get('/posts/:id', authenticateJWT,  PostController.getUserPosts);
router.get('/user-posts/:username', authenticateJWT, PostController.getPostsByUsername)

//feed
router.get('/feed', authenticateJWT, FeedController.getFeed);
export default router;