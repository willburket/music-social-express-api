import { Response } from 'express';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import FeedService from '../services/FeedService';
import BetService from '../services/BetService';

class BetController {
  async getScore(req: AuthenticatedRequest, res: Response): Promise<void> {


    try {
      const id = '3aa59d27bcd44984d6eecaf3f4ab6068';
      const sport = 'basketball_nba'
    //   const feed = await FeedService.getFeed();
    const bet = await BetService.getScore(sport, id) 
      res.status(200).json(bet);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new BetController();
