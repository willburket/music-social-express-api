import { Response } from 'express';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import FeedService from '../services/FeedService';
import BetService from '../services/BetService';

class BetController {
  async getScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = '56ee042b1559df60b76ff0483ad6826c';
      const sport = 'basketball_nba';
      //   const feed = await FeedService.getFeed();
      const bet = await BetService.getScore(sport, id);
      res.status(200).json(bet);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new BetController();
