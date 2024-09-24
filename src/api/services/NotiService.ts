import db from '../../config/database';
import PostService from './PostService';
import FeedHelper from '../helpers/FeedHelper';

class NotiService {
  static async createInteractionNoti(user: any, type: string, post: any) {
    try {
      const data = await db(process.env.POST_TABLE).select('*').where('id', '=', post);

      const postData = data[0];

      const noti = {
        username: postData.username,
        user_id: postData.user_id,
        noti_username: user.username,
        noti_user_id: user.id,
        noti_type: type,
        post_id: post,
      };

      const res = await db(process.env.NOTIFICATION_TABLE as string).insert(noti);
      await NotiService.deleteOldNotis(postData.user_id);
      return;
    } catch (error) {
      console.log('Error creating interaction notificaiton: ', error);
      throw error;
    }
  }

  static async createFollowNoti(userId: number, follower: any) {
    try {
      const data = await db(process.env.USER_TABLE).select('*').where('id', '=', userId);

      const user = data[0];

      const noti = {
        username: user.username,
        user_id: user.id,
        noti_username: follower.username,
        noti_user_id: follower.id,
        noti_type: 'follow',
      };

      const res = await db(process.env.NOTIFICATION_TABLE as string).insert(noti);

      return;
    } catch (error) {
      console.log('Error creating follow noti', error);
      throw error;
    }
  }

  static async getNotis(user: any) {
    try {
      const data = await db(process.env.NOTIFICATION_TABLE)
        .select('*')
        .where('user_id', '=', user.id)
        .orderBy('created', 'desc');

      const [users, posts] = await Promise.all([NotiService.getNotiUsers(data), NotiService.getNotiPosts(data)]);
      const fullPosts = await FeedHelper.checkLikeStatuses(user.id, posts);

      const fullNoti = data.map((noti) => {
        const user = users.find((user) => user.id === noti.noti_user_id);
        const post = noti.post_id ? fullPosts.find((post: any) => post.post_id === noti.post_id) : null;
        return {
          ...noti,
          user: user,
          post: post || null,
        };
      });

      return fullNoti;
    } catch (error) {
      console.log('Error getting notis: ', error);
      throw error;
    }
  }

  static async getNotiUsers(notis: any[]) {
    try {
      const ids = notis.map((noti) => noti.noti_user_id);
      const notiUserIds = [...new Set(ids)];
      const users = await db(process.env.USER_TABLE as string)
        .select(
          'id',
          'first_name',
          'last_name',
          'username',
          'winnings',
          'follower_count',
          'following_count',
          'bio',
          'profile_pic',
        )
        .whereIn('id', notiUserIds);
      return users;
    } catch (error) {
      console.log('Error getting noti users: ', error);
      throw error;
    }
  }

  static async getNotiPosts(notis: any[]) {
    try {
      const ids = notis.map((noti) => noti.post_id).filter((id) => id !== null && id !== undefined);
      const notiPostIds = [...new Set(ids)];

      const posts = await db(process.env.POST_TABLE as string)
        .join(
          `${process.env.BETSLIP_TABLE}`,
          `${process.env.POST_TABLE}.betslip`,
          '=',
          `${process.env.BETSLIP_TABLE}.id`,
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
        .whereIn(`${process.env.POST_TABLE}.id`, notiPostIds)
        // .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(25);

      //clean betslips
      const cleanedPosts = await PostService.cleanBetslips(posts);
      return cleanedPosts;
    } catch (error) {
      console.log('Error getting noti posts: ', error);
      throw error;
    }
  }

  static async setReadStatus(user: any) {
    try {
      await db(process.env.NOTIFICATION_TABLE as string)
        .where({ user_id: user.id })
        .update({ is_read: true });
      return;
    } catch (error) {
      console.log('Error getting read status: ', error);
      throw error;
    }
  }

  static async deleteOldNotis(userId: any) {
    try {
      const overflow = await db(process.env.NOTIFICATION_TABLE as string)
        .where({ user_id: userId })
        .orderBy('created', 'desc') // assuming the `created_at` field orders the notifications
        .offset(10) // skip the first 25 most recent notifications
        .pluck('id'); // get the IDs of the remaining notifications

      if (overflow.length > 0) {
        await db(process.env.NOTIFICATION_TABLE as string)
          .whereIn('id', overflow)
          .del();
      }
      return;
    } catch (error) {
      console.log('Error deleting old notis: ', error);
      throw error;
    }
  }
}

export default NotiService;
