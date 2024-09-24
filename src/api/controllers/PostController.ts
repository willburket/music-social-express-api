import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import PostService from '../services/PostService';
import { Response } from 'express';
import CreatePost from '../interfaces/CreatePost';
import BetService from '../services/BetService';
import FeedHelper from '../helpers/FeedHelper';
import NotificationController from './NotificationController';

class PostController {
  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let newPost;
      const currentUser = req.user;
      const content = req.body.text;

      if (currentUser) {
        let post: CreatePost = {
          userId: currentUser.id,
          username: currentUser.username,
          content: content,
          reply: false,
          replyTo: null,
          betslip: null,
        };

        const betslip = await BetService.createBetslip(currentUser, req.body);

        if (betslip) {
          post.betslip = betslip;
        }
        newPost = await PostService.createPost(post);
      }
      res.status(200).json(newPost);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getUserPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      // const page = req.query.page;
      const idNum: number = parseInt(id, 10);
      // const offset: number = parseInt(page, 10)

      const posts = await PostService.getUserPosts(idNum);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPostsByUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    const username = req.params.username;
    const user = req.user;

    const page = req.query.page;
    const pageNum: number = parseInt(page as string, 10);

    try {
      const posts = await PostService.getPostsByUsername(username, pageNum);
      const fullPosts = await FeedHelper.checkLikeStatuses(user!.id, posts);

      res.status(200).json(fullPosts);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async likePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    const postId = Number(req.params.id);
    const currentUser = req.user;

    try {
      if (currentUser) {
        await PostService.incrementLikeCount(postId, currentUser.id);
      }

      res.status(200).json({ message: 'Success' });
      await NotificationController.createInteractionNoti(currentUser, 'like', postId);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async unlikePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    const postId = Number(req.params.id);
    const currentUser = req.user;

    try {
      if (currentUser) {
        await PostService.decrementLikeCount(postId, currentUser.id);
      }

      res.status(200).json({ message: 'Success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async dislikePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    const postId = Number(req.params.id);
    const currentUser = req.user;

    try {
      if (currentUser) {
        await PostService.incrementDislikeCount(postId, currentUser.id);
      }

      res.status(200).json({ message: 'Success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async undislikePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    const postId = Number(req.params.id);
    const currentUser = req.user;

    try {
      if (currentUser) {
        await PostService.decrementDislikeCount(postId, currentUser.id);
      }

      res.status(200).json({ message: 'Success' });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new PostController();
