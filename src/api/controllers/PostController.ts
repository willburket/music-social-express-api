import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import PostService from '../services/PostService';
import { Request, Response } from 'express';
import CreatePost from '../interfaces/CreatePost';
import BetService from '../services/BetService';

class PostController {
  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let newPost;
      const currentUser = req.user;
      const content = req.body.text;

      console.log(req);

      if (currentUser) {
        let post: CreatePost = {
          userId: currentUser.id,
          username: currentUser.username,
          content: content,
          reply: false,
          replyTo: null,
          betslip: null,
        };

        const betslip = await BetService.createBetslip(req.body);
        console.log('Betslip id:', betslip);

        if (betslip) {
          post.betslip = betslip;
        }
        // console.log('Full Post:', req.body.picks[0].pick);

        // bet service to create bet
        // event service as needed
        // add items to betslip servce
        // add post w/ betslip id:

        //add betslip id to post table

        // DO NOT DELETE, THIS WAS HOW IT WORKED BEFORE, COMMENTED OUT FOR TESTING
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
      const idNum: number = parseInt(id, 10);
      const posts = await PostService.getUserPosts(idNum);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPostsByUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    const username = req.params.username;
    try {
      const posts = await PostService.getPostsByUsername(username);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new PostController();
