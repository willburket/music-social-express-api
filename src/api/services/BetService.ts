import db from '../../config/database';
const axios = require('axios');

const apiKey = process.env.ODDS_API_KEY;

class BetService {
  static async getScore(sport: string,id: string) {
    try {
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/scores/?apiKey=${apiKey}&eventIds=${id}`, {
      params: {
        apiKey,
      },
    });
        console.log(response.data[0].scores)
      return;
    } catch (error) {
      console.log('Error getting score:', error);
    }
  }
}

export default BetService;
