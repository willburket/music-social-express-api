import db from '../../config/database';
import FeedHelper from '../helpers/FeedHelper';

class FeedService {
  static async getFeed(id: number, offset: number) {
    try {
      const followedFeed = await FeedHelper.getFollowedUsersPosts(id, offset);
      console.log(followedFeed);
      return followedFeed;
    } catch (error) {
      console.log('Error fetching user:', error);
    }
  }
}

export default FeedService;
