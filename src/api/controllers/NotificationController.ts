import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import { Response } from 'express';
import NotiService from '../services/NotiService';
import UserService from '../services/UserService';

class NotificationController {
  async createInteractionNoti(user: any, notiType: string, postId: number): Promise<void> {
    try {
      // likes, dislikes
      await NotiService.createInteractionNoti(user, notiType, postId);
      return;
    } catch (error) {
      console.log('Error creating notification: ', error);
      throw error;
    }
  }

  async createFollowNoti(user: number, follower: any) {
    try {
      await NotiService.createFollowNoti(user, follower);
      await NotiService.deleteOldNotis(user);
    } catch (error) {
      console.log('Error creating notifcation: ', error);
    }
  }

  async setReadStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      await NotiService.setReadStatus(currentUser);
      res.status(200).json({ message: 'Success' });
    } catch (error) {
      throw error;
    }
  }

  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      const userId = currentUser?.id
  
      let notis = await NotiService.getNotis(currentUser);

      const profile = await UserService.getUserById(userId)
      if(profile !== undefined){
        for(let x = 0; x < notis.length; x++){
          notis[x].post.profile_pic = profile[0].profile_pic
        }
      }

      res.status(200).json(notis);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new NotificationController();
