import { Request, Response } from 'express';
import UserService from '../services/UserService'
import AuthUser from '../interfaces/AuthUser';
import SignUpUser from '../interfaces/SignUpUser'; 
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import { stat } from 'fs';

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

  async getFollowStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);

    try{
      const status = await UserService.getFollowStatus(currentUser as number, followedUserId)
      res.status(200).json(status)
    }catch(error){
      res.status(500).json(error)
    }
  }

  async followUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);
   
    try{
      UserService.followUser(currentUser as number,followedUserId);
      res.status(200)
    }catch(error){
      res.status(500).json(error)
    }
  }

  async unfollowUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    
    const currentUser = req.user?.id;
    const followedUser = req.params.id;
    const followedUserId: number = parseInt(followedUser, 10);
    try{
      UserService.unfollowUser(currentUser as number, followedUserId);
      res.status(200)
    }catch(error){
      res.status(500).json(error)
    }
    
  }

  async getFollowers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    try{
      const followers = await UserService.getFollowers(idNum)
      res.status(200).json(followers)
    }catch(error){
      res.status(500).json(error)
    }
  }
  async getFollowing(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id;
    const idNum: number = parseInt(id, 10);
    try{
      const following = await UserService.getFollowing(idNum)
      res.status(200).json(following)
    }catch(error){
      res.status(500).json(error)
    }
  }

}

export default new UserController();