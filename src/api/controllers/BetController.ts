import { Response } from 'express';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import FeedService from '../services/FeedService';
import BetService from '../services/BetService';

class BetController {
  async getScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const event = {
        api_id: '3e7324666d7c16c1184e9d44d986c21a',
        league: 'icehockey_nhl',
      };

      const eventId = 12;

      await BetService.getOutcome(event, eventId);

      res.status(200).json();
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new BetController();
