import db from '../../config/database';
import UserService from './UserService';

class LeaderService {
  static async getLeaders(type: string) {
    switch (type) {
      case 'top':
        let topUsers = await db(process.env.USER_TABLE as string)
          .select('username', 'winnings', 'profile_pic')
          .orderBy('winnings', 'desc')
          .limit(10);
        
        // get profile pics and update user items with signed urls 

        for(let x = 0; x < topUsers.length; x++){
          if(topUsers[x].profile_pic){
            const url = await UserService.getProfilePic(topUsers[x].profile_pic)
            topUsers[x].profile_pic = url;
          }
        }
        return topUsers;
        
      case 'bottom':
        let bottomUsers = await db(process.env.USER_TABLE as string)
          .select('username', 'winnings', 'profile_pic')
          .orderBy('winnings', 'asc')
          .limit(10);
        
        // get profile pics and update user items with signed urls 

        for(let x = 0; x < bottomUsers.length; x++){
          if(bottomUsers[x].profile_pic){
            const url = await UserService.getProfilePic(bottomUsers[x].profile_pic)
            bottomUsers[x].profile_pic = url;
          }
        }
        return bottomUsers;
    }
  }
}

export default LeaderService;
