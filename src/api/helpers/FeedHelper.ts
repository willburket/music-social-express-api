import db from '../../config/database';

class FeedHelper {
  static async getFollowedUsersPosts(userId: number, offset: number) {
    // make it so it filters out posts you've already liked/disliked/retweeted?
    try {
      const posts = await db
        .select(`${process.env.POST_TABLE}.*`, `${process.env.USER_TABLE}.username`)
        .from(`${process.env.POST_TABLE}`)
        .join(`${process.env.USER_TABLE}`, `${process.env.POST_TABLE}.user_id`, '=', `${process.env.USER_TABLE}.id`)
        .join(
          `${process.env.FOLLOWER_TABLE}`,
          `${process.env.FOLLOWER_TABLE}.followee_id`,
          '=',
          `${process.env.USER_TABLE}.id`,
        )
        .where(`${process.env.FOLLOWER_TABLE}.follower_id`, '=', userId)
        .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(3)
        .offset(offset);
      return posts;
    } catch (error) {
      console.log('Error getting Followed Users Feed:', error);
    }
  }
}

export default FeedHelper;
