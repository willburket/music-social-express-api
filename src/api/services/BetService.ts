import db from '../../config/database';
import BetSlip from '../interfaces/BetSlip';
const axios = require('axios');

const apiKey = process.env.ODDS_API_KEY;

class BetService {
  static async getScore(sport: string, id: string) {
    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/scores/?eventIds=${id}`, {
        params: {
          apiKey,
        },
      });
      console.log(response.data[0].scores);
      // above line returns
      //   [{ name: 'Dallas Mavericks', score: '114' },
      //   { name: 'Minnesota Timberwolves', score: '105' }]

      return;
    } catch (error) {
      console.log('Error getting score:', error);
    }
  }

  static async setBet(bet: any) {
    if (bet.type !== 'spreads') {
      try {
        const result = await db(process.env.BET_TABLE as string)
          .select('id')
          .where({
            api_event_id: bet.id,
            bet_type: bet.type,
            pick: bet.pick.name,
          });
        if (result.length > 0) {
          await BetService.incrementBetQty(result[0].id);
          return result[0].id;
        } else {
          const id = await BetService.createBet(bet);
          return id;
        }
      } catch (error) {
        console.log('Error setting bet', error);
      }
    } else {
      try {
        const result = await db(process.env.BET_TABLE as string)
          .select('id')
          .where({
            api_event_id: bet.id,
            bet_type: bet.type,
            pick: bet.pick.name,
            spread: bet.pick.point,
          });
        if (result.length > 0) {
          await BetService.incrementBetQty(result[0].id);
          return result[0].id;
        } else {
          const id = await BetService.createBet(bet);
          return id;
        }
      } catch (error) {
        console.log('Error setting bet', error);
      }
    }
  }
  static async createBet(bet: any) {
    const eventId = await BetService.setEvent(bet);

    try {
      let dbPost;
      if (bet.type === 'spreads') {
        dbPost = {
          api_event_id: bet.id,
          bet_type: bet.type,
          event_id: eventId,
          pick: bet.pick.name,
          spread: bet.pick.point,
          qty: 1,
          home: bet.home,
          away: bet.away,
          start_time: bet.time,
          league: bet.league,
        };
      } else {
        dbPost = {
          api_event_id: bet.id,
          event_id: eventId,
          bet_type: bet.type,
          pick: bet.pick.name,
          home: bet.home,
          away: bet.away,
          start_time: bet.time,
          qty: 1,
          league: bet.league,
        };
      }
      const res = await db(process.env.BET_TABLE as string).insert(dbPost);
      const postId = res[0];
      console.log('postId:', postId);
      return postId;
    } catch (error) {
      console.log('Error creating post:', error);
    }
  }

  static async setEvent(bet: any) {
    try {
      const result = await db(process.env.EVENT_TABLE as string)
        .select('id')
        .where({
          api_id: bet.id,
        });
      if (result.length > 0) {
        console.log('Event entry found:', result[0].id);

        return result[0].id;
      } else {
        console.log('No entry found');
        const id = await BetService.createEvent(bet);
        return id;
      }
    } catch (error) {
      console.log('Error setting bet', error);
    }
  }

  static async createEvent(bet: any) {
    try {
      const dbEvent = {
        api_id: bet.id,
        league: bet.league,
        home: bet.home,
        away: bet.away,
        start_time: bet.time,
      };

      const res = await db(process.env.EVENT_TABLE as string).insert(dbEvent);
      const eventId = res[0];
      return eventId;
    } catch (error) {
      console.log('Error creating event:', error);
    }
  }

  static async getBetIds(bets: any[]) {
    const betslip = [];
    try {
      for (let x = 0; x < bets.length; x++) {
        const id = await BetService.setBet(bets[x]);
        betslip.push(id);
      }
      return betslip;
    } catch (error) {
      console.log('Error getting bet Ids:', error);
    }
  }

  static async createBetslip(slip: any) {
    let betslip: BetSlip = {
      bet_1_id: null,
      bet_1_odds: null,
      bet_1_outcome: null,
      bet_2_id: null,
      bet_2_odds: null,
      bet_2_outcome: null,
      bet_3_id: null,
      bet_3_odds: null,
      bet_3_outcome: null,
      bet_4_id: null,
      bet_4_odds: null,
      bet_4_outcome: null,
      bet_5_id: null,
      bet_5_odds: null,
      bet_5_outcome: null,
      odds: slip.odds,
      wager: slip.wager,
      payout: slip.payout,
      outcome: null,
    };

    try {
      const betIds = await BetService.getBetIds(slip.picks);
      if (betIds) {
        for (let x = 0; x < slip.picks.length; x++) {
          (betslip as any)[`bet_${x + 1}_id`] = betIds[x];
          (betslip as any)[`bet_${x + 1}_odds`] = slip.picks[x].pick.price;
        }
        const res = await db(process.env.BETSLIP_TABLE as string).insert(betslip);
        const id = res[0];
        return id;
      }
    } catch (error) {
      console.log('Error creating Betslip:', error);
    }
  }

  static async incrementBetQty(betId: number) {
    try {
      await db(process.env.BET_TABLE as string)
        .increment('qty', 1)
        .where({ id: betId });
      return;
    } catch (error) {
      console.log('Error incrementing bet qty:', error);
    }
  }

  static async getOutcome(bet: string) {
    // getscore with id
    // check if game is finished
    // fill out outcome in db
  }

  static async scheduleCheck(bet: string) {
    // x amount of hours after game starts
    // if games not finished check again in 30 min?
  }
}

export default BetService;
