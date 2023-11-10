import { Request, Response } from 'express';
import UserService from '../services/UserService'
import AuthUser from '../interfaces/AuthUser';
class UserController {

  async getUser(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    const user = await UserService.getUser(username);
    // res.header('Access-Control-Allow-Origin', '*');
    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    
  }

  async authorizeUser(req: Request, res: Response): Promise<void> {
    const {email,password} = req.body;
    // const user = {email:email,password:password}
    const user: AuthUser = {
      email:email,
      password: password,
    }
    
    const jwt = await UserService.authorizeUser(user);
    // res.header('Access-Control-Allow-Origin', '*');
    res.json(jwt);
  }

  async getFollowStatus(req: Request, res: Response): Promise<void> {

  }

}

export default new UserController();