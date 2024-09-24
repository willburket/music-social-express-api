import express, { Router } from 'express';
import UserController from '../controllers/UserController';
import PostController from '../controllers/PostController';
import FeedController from '../controllers/FeedController';
import { authenticateJWT } from '../middlewares/Authenticate';
import BetController from '../controllers/BetController';
import LeaderboardController from '../controllers/LeaderboardController';
import NotificationController from '../controllers/NotificationController';

const router: Router = express.Router();
router.use(express.json());

//user
router.get('/users/:username', authenticateJWT, UserController.getUser);
router.post('/auth', UserController.authorizeUser);
router.post('/signup', UserController.createUser);
router.get('/followers/:id', authenticateJWT, UserController.getFollowers);
router.get('/following/:id', authenticateJWT, UserController.getFollowing);
router.get('/likes/:id', authenticateJWT, UserController.getLikedPosts);
router.get('/dislikes/:id', authenticateJWT, UserController.getDislikedPosts);
router.post('/profile/:id', authenticateJWT, UserController.editProfile);

// follow
router.post('/follow/:id', authenticateJWT, UserController.followUser);
router.get('/follow/:id', authenticateJWT, UserController.getFollowStatus);
router.delete('/follow/:id', authenticateJWT, UserController.unfollowUser);

//post
router.post('/posts', authenticateJWT, PostController.createPost);
router.get('/posts/:id', authenticateJWT, PostController.getUserPosts);
router.get('/user-posts/:username', authenticateJWT, PostController.getPostsByUsername);
router.post('/posts/likes/:id', authenticateJWT, PostController.likePost);
router.delete('/posts/likes/:id', authenticateJWT, PostController.unlikePost);
router.post('/posts/dislikes/:id', authenticateJWT, PostController.dislikePost);
router.delete('/posts/dislikes/:id', authenticateJWT, PostController.undislikePost);

//feed
router.get('/feed', authenticateJWT, FeedController.getFeed);

//betting
router.get('/scores', BetController.getScore);
// router.get('/games', BetController.getGames);
// router.get('/outcome', BetController.getOutcome);

// notifications
router.get('/notifications', authenticateJWT, NotificationController.getNotifications);
router.post('/notifications', authenticateJWT, NotificationController.setReadStatus);

//leaderboards
router.get('/leaderboards/:type', authenticateJWT, LeaderboardController.getLeaderboard);

export default router;
