import { Request, Response } from 'express';
import UserService from '../services/UserService'

class UserController {

  async getUser(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    const user = await UserService.getUser(username);
    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    
  }

  async authorizeUser(req: Request, res: Response): Promise<void> {
    // const user = req.body;
    const user = {
      email: 'admin',
      password: 'admin',
    }

    console.log(user)
    const jwt = await UserService.authorizeUser(user);
    res.json(jwt);
  }

  async getFollowStatus(req: Request, res: Response): Promise<void> {

  }

}

export default new UserController();