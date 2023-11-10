import { Request, Response } from 'express';
import UserService from '../services/UserService'

class UserController {

  
  async getUser(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    const user = await UserService.getUser(username);
    res.json(user);
  }

  
}

export default new UserController();