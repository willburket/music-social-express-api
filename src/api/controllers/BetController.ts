import { Response } from 'express';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import FeedService from '../services/FeedService';
import BetService from '../services/BetService';

class BetController {
  async getScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = '44eb2ab1727245ca4445455e8883013f';
      const sport = 'icehockey_nhl';
      const bet = null;

      await BetService.populateBetslips(21, 'W');

      res.status(200).json(bet);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new BetController();
