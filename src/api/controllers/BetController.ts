import { Response } from 'express';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';
import BetService from '../services/BetService';

class BetController {
  async getScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const event = {
        api_id: '230a9d381f66262b7dab9807503ca02b',
        league: 'baseball_mlb',
      };

      const eventId = 19;

      await BetService.getOutcome(event, eventId);

      res.status(200).json();
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getGames(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
    } catch (error) {
      res.status(500).json(error);
    }
  }
  async getOutcome(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new BetController();
