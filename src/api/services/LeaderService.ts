import db from '../../config/database';

class LeaderService {
  static async getLeaders(type: string) {
    switch (type) {
      case 'top':
        const topUsers = await db(process.env.USER_TABLE as string)
          .select('username', 'winnings')
          .orderBy('winnings', 'desc')
          .limit(10);
        return topUsers;
      case 'bottom':
        const bottomUsers = await db(process.env.USER_TABLE as string)
          .select('username', 'winnings')
          .orderBy('winnings', 'asc')
          .limit(10);
        return bottomUsers;
    }
  }
}

export default LeaderService;
