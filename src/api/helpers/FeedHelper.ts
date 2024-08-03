import db from '../../config/database';
import PostService from '../services/PostService';

class FeedHelper {
  static async getFollowedUsersPosts(userId: number, offset: number) {
    try {
      const posts = await db(process.env.POST_TABLE as string)
        .join(
          `${process.env.BETSLIP_TABLE}`,
          `${process.env.POST_TABLE}.betslip`,
          '=',
          `${process.env.BETSLIP_TABLE}.id`,
        )
        .join(`${process.env.USER_TABLE}`, `${process.env.POST_TABLE}.user_id`, '=', `${process.env.USER_TABLE}.id`)
        .join(
          `${process.env.FOLLOWER_TABLE}`,
          `${process.env.FOLLOWER_TABLE}.followee_id`,
          '=',
          `${process.env.USER_TABLE}.id`,
        )
        .leftJoin(`${process.env.BET_TABLE} as bet1`, 'Betslips.bet_1_id', 'bet1.id')
        .leftJoin(`${process.env.BET_TABLE} as bet2`, 'Betslips.bet_2_id', 'bet2.id')
        .leftJoin(`${process.env.BET_TABLE} as bet3`, 'Betslips.bet_3_id', 'bet3.id')
        .leftJoin(`${process.env.BET_TABLE} as bet4`, 'Betslips.bet_4_id', 'bet4.id')
        .leftJoin(`${process.env.BET_TABLE} as bet5`, 'Betslips.bet_5_id', 'bet5.id')
        .select(
          'Tweets.id as post_id',
          'Tweets.user_id as user_id',
          'Tweets.username as username',
          'Tweets.content as post_content',
          'Tweets.created as created_at',
          'Tweets.like_count as like_count',
          'Tweets.dislike_count as dislike_count',
          'Tweets.retweet_count as repost_count',
          'Tweets.reply as reply',
          'Tweets.reply_to as reply_to',
          'Betslips.id as betslip_id',
          'Betslips.odds as odds',
          'Betslips.wager as wager',
          'Betslips.odds as odds',
          'Betslips.payout as payout',
          'Betslips.outcome as outcome',

          db.raw(`
            JSON_ARRAY(
              JSON_OBJECT("id", bet1.id, "event_id", bet1.event_id, "odds", Betslips.bet_1_odds, "type", bet1.bet_type, "pick", bet1.pick, "outcome", bet1.outcome, "point", bet1.point, "home", bet1.home, "away", bet1.away, "date", bet1.start_time),
              JSON_OBJECT("id", bet2.id, "event_id", bet2.event_id, "odds", Betslips.bet_2_odds, "type", bet2.bet_type, "pick", bet2.pick, "outcome", bet2.outcome, "point", bet2.point, "home", bet2.home, "away", bet2.away, "date", bet2.start_time),
              JSON_OBJECT("id", bet3.id, "event_id", bet3.event_id, "odds", Betslips.bet_3_odds, "type", bet3.bet_type, "pick", bet3.pick, "outcome", bet3.outcome, "point", bet3.point, "home", bet3.home, "away", bet3.away, "date", bet3.start_time),
              JSON_OBJECT("id", bet4.id, "event_id", bet4.event_id, "odds", Betslips.bet_4_odds, "type", bet4.bet_type, "pick", bet4.pick, "outcome", bet4.outcome, "point", bet4.point, "home", bet4.home, "away", bet4.away, "date", bet4.start_time),
              JSON_OBJECT("id", bet5.id, "event_id", bet5.event_id, "odds", Betslips.bet_5_odds, "type", bet5.bet_type, "pick", bet5.pick, "outcome", bet5.outcome, "point", bet5.point, "home", bet5.home, "away", bet5.away, "date", bet5.start_time)
            ) as bets_data
            `),
        )
        // .where(`${process.env.POST_TABLE}.user_id`, '=', userId)

        .where(`${process.env.FOLLOWER_TABLE}.follower_id`, '=', userId)
        .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(3);
      // .offset(offset);

      //clean betslips
      const cleanedPosts = await PostService.cleanBetslips(posts);
      return cleanedPosts;
    } catch (error) {
      console.log('Error getting followed user posts:', error);
    }
  }

  static async checkLikeStatuses(userId: number, postArray: any[]) {
    try {
      const postIds = postArray.map((post) => post.post_id);

      const [likedPosts, dislikedPosts] = await Promise.all([
        await db(process.env.LIKES_TABLE).whereIn('post_id', postIds).andWhere('user_id', userId).select('post_id'),
        await db(process.env.DISLIKES_TABLE).whereIn('post_id', postIds).andWhere('user_id', userId).select('post_id'),
      ]);

      const likedPostIds = new Set(likedPosts.map((like) => like.post_id));
      const dislikedPostIds = new Set(dislikedPosts.map((dislike) => dislike.post_id));

      postArray.forEach((post) => {
        post.liked = likedPostIds.has(post.post_id);
        post.disliked = dislikedPostIds.has(post.post_id);
      });

      return postArray;
    } catch (error) {
      console.log('Error getting like statuses: ', error);
      throw error;
    }
  }

  static async getLikedPosts(userId: number) {
    try {
      const posts = await db(process.env.POST_TABLE as string)
        .join(
          `${process.env.BETSLIP_TABLE}`,
          `${process.env.POST_TABLE}.betslip`,
          '=',
          `${process.env.BETSLIP_TABLE}.id`,
        )
        .join(`${process.env.USER_TABLE}`, `${process.env.POST_TABLE}.user_id`, '=', `${process.env.USER_TABLE}.id`)
        .join(`${process.env.LIKES_TABLE}`, `${process.env.POST_TABLE}.id`, '=', `${process.env.LIKES_TABLE}.post_id`)
        .leftJoin(`${process.env.BET_TABLE} as bet1`, 'Betslips.bet_1_id', 'bet1.id')
        .leftJoin(`${process.env.BET_TABLE} as bet2`, 'Betslips.bet_2_id', 'bet2.id')
        .leftJoin(`${process.env.BET_TABLE} as bet3`, 'Betslips.bet_3_id', 'bet3.id')
        .leftJoin(`${process.env.BET_TABLE} as bet4`, 'Betslips.bet_4_id', 'bet4.id')
        .leftJoin(`${process.env.BET_TABLE} as bet5`, 'Betslips.bet_5_id', 'bet5.id')
        .select(
          'Tweets.id as post_id',
          'Tweets.user_id as user_id',
          'Tweets.username as username',
          'Tweets.content as post_content',
          'Tweets.created as created_at',
          'Tweets.like_count as like_count',
          'Tweets.dislike_count as dislike_count',
          'Tweets.retweet_count as repost_count',
          'Tweets.reply as reply',
          'Tweets.reply_to as reply_to',
          'Betslips.id as betslip_id',
          'Betslips.odds as odds',
          'Betslips.wager as wager',
          'Betslips.odds as odds',
          'Betslips.payout as payout',
          'Betslips.outcome as outcome',

          db.raw(`
            JSON_ARRAY(
              JSON_OBJECT("id", bet1.id, "event_id", bet1.event_id, "odds", Betslips.bet_1_odds, "type", bet1.bet_type, "pick", bet1.pick, "outcome", bet1.outcome, "point", bet1.point, "home", bet1.home, "away", bet1.away, "date", bet1.start_time),
              JSON_OBJECT("id", bet2.id, "event_id", bet2.event_id, "odds", Betslips.bet_2_odds, "type", bet2.bet_type, "pick", bet2.pick, "outcome", bet2.outcome, "point", bet2.point, "home", bet2.home, "away", bet2.away, "date", bet2.start_time),
              JSON_OBJECT("id", bet3.id, "event_id", bet3.event_id, "odds", Betslips.bet_3_odds, "type", bet3.bet_type, "pick", bet3.pick, "outcome", bet3.outcome, "point", bet3.point, "home", bet3.home, "away", bet3.away, "date", bet3.start_time),
              JSON_OBJECT("id", bet4.id, "event_id", bet4.event_id, "odds", Betslips.bet_4_odds, "type", bet4.bet_type, "pick", bet4.pick, "outcome", bet4.outcome, "point", bet4.point, "home", bet4.home, "away", bet4.away, "date", bet4.start_time),
              JSON_OBJECT("id", bet5.id, "event_id", bet5.event_id, "odds", Betslips.bet_5_odds, "type", bet5.bet_type, "pick", bet5.pick, "outcome", bet5.outcome, "point", bet5.point, "home", bet5.home, "away", bet5.away, "date", bet5.start_time)
            ) as bets_data
            `),
        )
        // .where(`${process.env.POST_TABLE}.user_id`, '=', userId)

        .where(`${process.env.LIKES_TABLE}.user_id`, '=', userId)
        .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(3);
      // .offset(offset);

      //clean betslips
      const cleanedPosts = await PostService.cleanBetslips(posts);

      cleanedPosts.forEach((post: any) => {
        post.liked = true;
        post.disliked = false;
      });

      return cleanedPosts;
    } catch (error) {
      console.log('Error getting liked posts:', error);
    }
  }

  static async getDislikedPosts(userId: number) {
    try {
      const posts = await db(process.env.POST_TABLE as string)
        .join(
          `${process.env.BETSLIP_TABLE}`,
          `${process.env.POST_TABLE}.betslip`,
          '=',
          `${process.env.BETSLIP_TABLE}.id`,
        )
        .join(`${process.env.USER_TABLE}`, `${process.env.POST_TABLE}.user_id`, '=', `${process.env.USER_TABLE}.id`)
        .join(
          `${process.env.DISLIKES_TABLE}`,
          `${process.env.POST_TABLE}.id`,
          '=',
          `${process.env.DISLIKES_TABLE}.post_id`,
        )
        .leftJoin(`${process.env.BET_TABLE} as bet1`, 'Betslips.bet_1_id', 'bet1.id')
        .leftJoin(`${process.env.BET_TABLE} as bet2`, 'Betslips.bet_2_id', 'bet2.id')
        .leftJoin(`${process.env.BET_TABLE} as bet3`, 'Betslips.bet_3_id', 'bet3.id')
        .leftJoin(`${process.env.BET_TABLE} as bet4`, 'Betslips.bet_4_id', 'bet4.id')
        .leftJoin(`${process.env.BET_TABLE} as bet5`, 'Betslips.bet_5_id', 'bet5.id')
        .select(
          'Tweets.id as post_id',
          'Tweets.user_id as user_id',
          'Tweets.username as username',
          'Tweets.content as post_content',
          'Tweets.created as created_at',
          'Tweets.like_count as like_count',
          'Tweets.dislike_count as dislike_count',
          'Tweets.retweet_count as repost_count',
          'Tweets.reply as reply',
          'Tweets.reply_to as reply_to',
          'Betslips.id as betslip_id',
          'Betslips.odds as odds',
          'Betslips.wager as wager',
          'Betslips.odds as odds',
          'Betslips.payout as payout',
          'Betslips.outcome as outcome',

          db.raw(`
            JSON_ARRAY(
              JSON_OBJECT("id", bet1.id, "event_id", bet1.event_id, "odds", Betslips.bet_1_odds, "type", bet1.bet_type, "pick", bet1.pick, "outcome", bet1.outcome, "point", bet1.point, "home", bet1.home, "away", bet1.away, "date", bet1.start_time),
              JSON_OBJECT("id", bet2.id, "event_id", bet2.event_id, "odds", Betslips.bet_2_odds, "type", bet2.bet_type, "pick", bet2.pick, "outcome", bet2.outcome, "point", bet2.point, "home", bet2.home, "away", bet2.away, "date", bet2.start_time),
              JSON_OBJECT("id", bet3.id, "event_id", bet3.event_id, "odds", Betslips.bet_3_odds, "type", bet3.bet_type, "pick", bet3.pick, "outcome", bet3.outcome, "point", bet3.point, "home", bet3.home, "away", bet3.away, "date", bet3.start_time),
              JSON_OBJECT("id", bet4.id, "event_id", bet4.event_id, "odds", Betslips.bet_4_odds, "type", bet4.bet_type, "pick", bet4.pick, "outcome", bet4.outcome, "point", bet4.point, "home", bet4.home, "away", bet4.away, "date", bet4.start_time),
              JSON_OBJECT("id", bet5.id, "event_id", bet5.event_id, "odds", Betslips.bet_5_odds, "type", bet5.bet_type, "pick", bet5.pick, "outcome", bet5.outcome, "point", bet5.point, "home", bet5.home, "away", bet5.away, "date", bet5.start_time)
            ) as bets_data
            `),
        )
        // .where(`${process.env.POST_TABLE}.user_id`, '=', userId)

        .where(`${process.env.DISLIKES_TABLE}.user_id`, '=', userId)
        .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(3);
      // .offset(offset);

      //clean betslips
      const cleanedPosts = await PostService.cleanBetslips(posts);

      cleanedPosts.forEach((post: any) => {
        post.liked = false;
        post.disliked = true;
      });

      return cleanedPosts;
    } catch (error) {
      console.log('Error getting liked posts:', error);
    }
  }
}

export default FeedHelper;
