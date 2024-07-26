import { Response } from 'express';
import LeaderService from '../services/LeaderService';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';

class LeaderboardController {
  async getLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const type = req.params.type;

    try {
      console.log('Type', type);

      const leaderItems = await LeaderService.getLeaders(type);
      res.status(200).json(leaderItems);
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
}

export default new LeaderboardController();
