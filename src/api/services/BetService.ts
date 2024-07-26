import { compareSync } from 'bcrypt';
import db from '../../config/database';
import BetSlip from '../interfaces/BetSlip';
import Score from '../interfaces/Score';
const schedule = require('node-schedule');

const axios = require('axios');

const apiKey = process.env.ODDS_API_KEY;
const daysFrom = 1; // change to 1

class BetService {
  static async getGameData(event: any) {
    const sport = event.league;
    const id = event.api_id;

    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/scores/?eventIds=${id}`, {
        params: {
          apiKey,
          daysFrom,
        },
      });

      const gameData = response.data[0];
      return gameData;
    } catch (error) {
      console.log('Error getting score:', error);
    }
  }

  static async setBet(bet: any) {
    if (bet.type === 'h2h') {
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
            point: bet.pick.point,
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
      if (bet.type === 'spreads' || bet.type === 'totals') {
        dbPost = {
          api_event_id: bet.id,
          bet_type: bet.type,
          event_id: eventId,
          pick: bet.pick.name,
          point: bet.pick.point,
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
        return result[0].id;
      } else {
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

      console.log('EventID:', eventId);

      // schedule outcome check
      await BetService.scheduleCheck(eventId, dbEvent);

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

  static async createBetslip(user: any, slip: any) {
    let betslip: BetSlip = {
      id: null,
      username: user.username,
      user_id: user.id,
      bet_1_id: null,
      bet_1_odds: null,
      bet_2_id: null,
      bet_2_odds: null,
      bet_3_id: null,
      bet_3_odds: null,
      bet_4_id: null,
      bet_4_odds: null,
      bet_5_id: null,
      bet_5_odds: null,
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

  //   const dbEvent = {
  //     api_id: bet.id,
  //     league: bet.league,
  //     home: bet.home,
  //     away: bet.away,
  //     start_time: bet.time,
  //   };

  static async getOutcome(event: any, eventId: number) {
    const gameData = await BetService.getGameData(event);

    if (gameData.completed) {
      // fill out outcome in event db
      const scoreObj = await BetService.setEventOutcome(gameData, eventId);
      await BetService.populateBetOutcomes(eventId, scoreObj);
      return true;
    } else {
      //reschedule
      console.log('Game not complete');
      return false;
    }
  }

  static async setEventOutcome(gameData: any, eventId: number) {
    const scores = gameData.scores;

    let scoreObj: Score = {
      home: null,
      away: null,
    };

    try {
      for (let x = 0; x < scores.length; x++) {
        const score = parseInt(scores[x].score);

        if (scores[x].name === gameData.home_team) {
          await db(process.env.EVENT_TABLE as string)
            .where('id', eventId)
            .update('home_score', score);

          scoreObj.home = score;
        } else {
          await db(process.env.EVENT_TABLE as string)
            .where('id', eventId)
            .update('away_score', score);

          scoreObj.away = score;
        }
      }

      return scoreObj;
    } catch (error) {
      console.log('Error setting Outcome:', error);
    }
  }

  static async scheduleCheck(eventId: number, dBevent: any) {
    let checkTime;
    const initialDate = new Date(dBevent.start_time);

    switch (dBevent.league) {
      case 'basketball_nba':
        // 2.25 h
        checkTime = new Date(initialDate.getTime() + 2.25 * 60 * 60 * 1000);
      case 'baseball_mlb':
        // 2.75 h
        checkTime = new Date(initialDate.getTime() + 2.75 * 60 * 60 * 1000);
      case 'americanfootball_nfl':
        // 3.25 h
        checkTime = new Date(initialDate.getTime() + 3.25 * 60 * 60 * 1000);
      case 'icehockey_nhl':
        // 2.5 h
        checkTime = new Date(initialDate.getTime() + 2.5 * 60 * 60 * 1000);
      case 'soccer_epl':
        // 2 h
        checkTime = new Date(initialDate.getTime() + 2 * 60 * 60 * 1000);
    }

    try {
      // schedule getOutcome duration of hours after game starts
      const gameOutcome = await schedule.scheduleJob(checkTime, () => BetService.getOutcome(dBevent, eventId));
      console.log('Check scheduled');
      if (!gameOutcome) {
        // if games not finished check again in 15 min
        await BetService.rescheduleCheck(eventId, dBevent);
      }
    } catch (error) {
      console.log('Error scheduling check:', error);
    }
  }

  static async rescheduleCheck(eventId: number, dBevent: any) {
    const fifteenMinutes = new Date(Date.now() + 15 * 60 * 1000);
    const gameOutcome = await schedule.scheduleJob(fifteenMinutes, () => BetService.getOutcome(dBevent, eventId));

    if (!gameOutcome) {
      await BetService.rescheduleCheck(eventId, dBevent);
      console.log('Rescheduling check for 15 minutes');
    }
    return;
  }

  static async populateBetOutcomes(eventId: number, score: any) {
    try {
      // get list of all Bets dB entries that bet on a given event
      const bets = await db(process.env.BET_TABLE as string)
        .where('event_id', eventId)
        .select('*');

      console.log('populate bet outcomes:', bets);

      // I think we can do this better with joins?*******

      for (let x = 0; x < bets.length; x++) {
        const outcome = await BetService.getBetOutcome(bets[x], score);
        // set outcome in bet dB
        if (outcome) {
          await Promise.all([
            // update bet table
            db(process.env.BET_TABLE as string)
              .where('id', bets[x].id)
              .update('outcome', outcome),
            // populate betslips that include this bet
            BetService.populateBetslips(bets[x].id, outcome),
          ]);

          //    // update bet table
          //    await db(process.env.BET_TABLE as string)
          //    .where('id', bets[x].id)
          //    .update('outcome', outcome),
          //    // populate betslips that include this bet
          //    await BetService.populateBetslips(bets[x].id, outcome)
        }
      }
    } catch (error) {
      console.log('Error populating bet outcome:', error);
    }
  }

  static async populateBetslips(betId: number, outcome: string) {
    try {
      const betslips = await db(process.env.BETSLIP_TABLE as string)
        .where('bet_1_id', betId)
        .orWhere('bet_2_id', betId)
        .orWhere('bet_3_id', betId)
        .orWhere('bet_4_id', betId)
        .orWhere('bet_5_id', betId)
        .select('*');

      console.log('POPULATING BETSLIPS', betslips);

      for (let x = 0; x < betslips.length; x++) {
        // const id = betslips[x].id;

        const updatedSlip = await BetService.populateBetslip(betId, betslips[x], outcome);

        if (updatedSlip) {
          await BetService.updateBetslipOutcome(updatedSlip, outcome);
        }
      }
      return;
    } catch (error) {
      console.log('Error populating betslips:', error);
    }
  }

  static async populateBetslip(betId: number, betslip: BetSlip, outcome: string) {
    try {
      for (let y = 1; y <= 5; y++) {
        const betIdKey = `bet_${y}_id`;
        const betOutcomeKey = `bet_${y}_outcome`;

        if ((betslip as any)[betIdKey] === betId) {
          (betslip as any)[betOutcomeKey] = outcome;

          await db(process.env.BETSLIP_TABLE as string)
            .where('id', betslip.id)
            .update(`bet_${y}_outcome`, outcome);

          console.log('populateBetslip:', betslip);

          return betslip;
        }
      }
    } catch (error) {
      console.log('Error populating betslip:', error);
    }
  }

  static async updateBetslipOutcome(betslip: BetSlip, outcome: string) {
    try {
      const isFinalBet = await BetService.finalBetCheck(betslip);

      if (betslip.outcome === null) {
        if (outcome === 'L') {
          await Promise.all([
            // set betslip outcome to L
            db(process.env.BETSLIP_TABLE as string)
              .where('id', betslip.id)
              .update('outcome', 'L'),
            // subtract wager from users overall winnings
            db(process.env.USER_TABLE as string)
              .where('id', betslip.user_id)
              .decrement('winnings', betslip.wager!),
          ]);
        } else if (outcome === 'D') {
          // set betslip to draw
          await db(process.env.BETSLIP_TABLE as string)
            .where('id', betslip.id)
            .update('outcome', 'D');
          // push, no need to update
        } else if (outcome === 'W' && isFinalBet) {
          await Promise.all([
            // set betslip outcome to W
            db(process.env.BETSLIP_TABLE as string)
              .where('id', betslip.id)
              .update('outcome', 'W'),
            // add payout to users overall winnings
            db(process.env.USER_TABLE as string)
              .where('id', betslip.user_id)
              .increment('winnings', betslip.payout!),
          ]);
        }
      }
    } catch (error) {
      console.log('Error updating betslip outcome:', error);
    }
  }

  static async finalBetCheck(betslip: BetSlip) {
    for (let x = 1; x <= 5; x++) {
      const betIdKey = `bet_${x}_id`;
      const betOutcomeKey = `bet_${x}_outcome`;

      if ((betslip as any)[betIdKey] !== null && (betslip as any)[betOutcomeKey] === null) {
        return false;
      }
      if ((betslip as any)[betOutcomeKey] === 'L' || (betslip as any)[betOutcomeKey] === 'D') {
        return false;
      }
      if ((betslip as any)[betIdKey] === null) {
        return true;
      }
    }
    return true;
  }

  static async getBetOutcome(bet: any, score: any) {
    if (bet.bet_type === 'h2h') {
      return await BetService.checkML(bet, score);
    } else if (bet.bet_type === 'spreads') {
      return await BetService.checkSpread(bet, score);
    } else if (bet.bet_type === 'totals') {
      return await BetService.checkTotal(bet, score);
    }
  }

  static async checkML(bet: any, score: any) {
    try {
      if (bet.pick === bet.home) {
        //home_team?
        if (score.home > score.away) {
          return 'W';
        } else if (score.home < score.away) {
          return 'L';
        } else if (score.home === score.away) {
          //PUSH
          return 'D';
        }
      } else {
        if (score.home < score.away) {
          return 'W';
        } else if (score.home > score.away) {
          return 'L';
        } else if (score.home === score.away) {
          return 'D';
        }
      }
    } catch (error) {
      console.log('Error checking ML bet:', error);
    }
  }

  static async checkSpread(bet: any, score: any) {
    const teamScore = bet.pick === bet.home ? score.home : score.away; // check
    const oppScore = bet.pick === bet.away ? score.away : score.home;
    const pointDiff = teamScore - oppScore; // if point diff is positive you win

    try {
      if (pointDiff > bet.point * -1) {
        return 'W';
      } else if (pointDiff < bet.point * -1) {
        return 'L';
      } else if (pointDiff === bet.point * -1) {
        return 'D';
      }
    } catch (error) {
      console.log('Error checking spread bet:', error);
    }
  }

  static async checkTotal(bet: any, score: any) {
    const total = score.home + score.away;

    try {
      if (bet.pick === 'Over' && total > bet.point) {
        return 'W';
      } else if (bet.pick === 'Under' && total < bet.point) {
        return 'W';
      } else if (total === bet.point) {
        return 'D';
      } else {
        return 'L';
      }
    } catch (error) {
      console.log('Error checking total bet:', error);
    }
  }
}

export default BetService;

// Score response, for reference
// {
//     id: '44eb2ab1727245ca4445455e8883013f',
//     sport_key: 'icehockey_nhl',
//     sport_title: 'NHL',
//     commence_time: '2024-06-01T00:40:21Z',
//     completed: false,
//     home_team: 'Dallas Stars',
//     away_team: 'Edmonton Oilers',
//     scores: [
//       { name: 'Dallas Stars', score: '0' },
//       { name: 'Edmonton Oilers', score: '3' }
//     ],
//     last_update: '2024-06-01T02:34:40Z'
//   }

// '48dbd6bbfeb72fae383de550504df9cc','basketball_nba'
