import { Request, Response } from 'express';
import UserService from '../services/UserService';
import AuthUser from '../interfaces/AuthUser';
import SignUpUser from '../interfaces/SignUpUser';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import NotificationController from './NotificationController';
import multer from 'multer';

type MulterFile = Express.Multer.File & {
  buffer: Buffer;
};

interface MulterRequest extends AuthenticatedRequest {
  file?: MulterFile;
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

class UserController {
  async getUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const username = req.params.username;
    const user = await UserService.getUser(username);
    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const user: SignUpUser = {
      first: req.body.firstName,
      last: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      bio: null,
      followingCount: 0,
      followerCount: 0,
    };
    const jwt = await UserService.createUser(user);
    res.json(jwt);
  }

  async authorizeUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const user: AuthUser = {
      email: email,
      password: password,
    };

    const jwt = await UserService.authorizeUser(user);
    res.json(jwt);
  }

  async getFollowStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);

    try {
      const status = await UserService.getFollowStatus(currentUser as number, followedUserId);
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async followUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);

    try {
      UserService.followUser(currentUser as number, followedUserId);
      res.status(200);
      await NotificationController.createFollowNoti(followedUserId, req.user);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async unfollowUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);
    try {
      UserService.unfollowUser(currentUser as number, followedUserId);
      res.status(200);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getFollowers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    const page = req.query.page;
    const pageNum: number = parseInt(page as string, 10);

    try {
      const followers = await UserService.getFollowers(idNum, pageNum);
      res.status(200).json(followers);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async getFollowing(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    const page = req.query.page;
    const pageNum: number = parseInt(page as string, 10);

    try {
      const following = await UserService.getFollowing(idNum, pageNum);
      res.status(200).json(following);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async getLikedPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    // const currentUser = req.user?.id;
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    const page = req.query.page;
    const pageNum: number = parseInt(page as string, 10);

    try {
      // if(currentUser){
      const following = await UserService.getLikedPosts(idNum, pageNum);
      // }
      res.status(200).json(following);
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async getDislikedPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    // const currentUser = req.user?.id;
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    const page = req.query.page;
    const pageNum: number = parseInt(page as string, 10);

    try {
      // if(currentUser){
      const following = await UserService.getDislikedPosts(idNum, pageNum);
      // }
      res.status(200).json(following);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async editProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    const user = req.user?.id;
    let token: any;

    // Handle the multipart form data
    upload.single('profile_pic')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error' });
      }

      const userObj = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        username: req.body.username,
        bio: req.body.bio,
        profile_pic: req.file ? (req.file as MulterFile).buffer : req.body.profile_pic,
      };

      console.log("userObj: ", userObj)
      try {
        if (user) {
          token = await UserService.editProfile(user, userObj);
        }
        res.status(200).json(token);
      } catch (error) {
        res.status(500).json(error);
      }
    });
  }
}

export default new UserController();
