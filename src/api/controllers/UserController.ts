import { Request, Response } from 'express';
import UserService from '../services/UserService'
import AuthUser from '../interfaces/AuthUser';
import SignUpUser from '../interfaces/SignUpUser'; 

class UserController {

  async getUser(req: Request, res: Response): Promise<void> {
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
    }
    const jwt = await UserService.createUser(user)
    res.json(jwt)
  }

  async authorizeUser(req: Request, res: Response): Promise<void> {
    const {email,password} = req.body;
    const user: AuthUser = {
      email:email,
      password: password,
    }
    
    const jwt = await UserService.authorizeUser(user);
    res.json(jwt);
  }

  async getFollowStatus(req: Request, res: Response): Promise<void> {

  }

}

export default new UserController();