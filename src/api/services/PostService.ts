import db from '../../config/database';
import BetController from '../controllers/BetController';
import NotificationController from '../controllers/NotificationController';
import CreatePost from '../interfaces/CreatePost';
const fs = require('fs');
const path = require('path');

class PostService {
  static async createPost(post: CreatePost) {
    try {
      // console.log(post)
      // const hash = await bcrypt.hash(user.password,saltRounds);
      const dbPost = {
        username: post.username,
        user_id: post.userId,
        content: post.content,
        reply: post.reply,
        betslip: post.betslip,
      };

      const res = await db(process.env.POST_TABLE as string).insert(dbPost);
      //check what the response is here!
      const postId = res[0];

      // why am I doing this?
      const postObject = await db(process.env.POST_TABLE as string)
        .where({ id: postId })
        .select('*');

      return postObject[0];
    } catch (error) {
      console.log('Error creating post:', error);
      return;
    }
  }

  static async getUserPosts(id: number) {
    try {
      const userPosts = await db(process.env.POST_TABLE as string)
        .where({ user_id: id })
        .select('*');

      // const userPosts = await db(process.env.POST_TABLE as string)
      //   .leftJoin('Betslips', 'Tweets.betslip_id', 'Betslips.id')
      //   .select('*')
      //   .where('Tweets.user_id', id)

      return userPosts;
    } catch (error) {
      console.log("Error getting user's posts:", error);
    }
  }

  static async getPostsByUsername(username: string, page: number) {
    const offset = 3 * page;

    try {
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
        .where(`${process.env.POST_TABLE}.username`, '=', username)
        .orderBy(`${process.env.POST_TABLE}.created`, 'desc')
        .limit(3)
        .offset(offset);

      //clean betslips
      const cleanedPosts = await PostService.cleanBetslips(posts);

      return cleanedPosts;
    } catch (error) {
      console.error('Error fetching user tweets with betslips and bets:', error);
      throw error;
    }
  }
  static async getBets(betslipId: number) {}

  static async cleanBetslips(posts: any) {
    const cleanedPosts = posts.map((post: any) => {
      const filteredBets = post.bets_data.filter((bet: any) => bet.id !== null);
      return {
        ...post,
        bets_data: filteredBets,
      };
    });
    return cleanedPosts;
  }

  static async incrementLikeCount(postId: number, userId: number) {
    try {
      const filePath = path.join(__dirname, '../scripts/incrementLikes.sql');
      const sqlQuery = await fs.readFileSync(filePath, 'utf-8');
      const [transQuery, updateQuery, insertQuery, commitQuery] = sqlQuery.split(';').map((query: any) => query.trim());

      // can we not use a promise.all on the middle two?
      await db.raw(transQuery);
      await db.raw(updateQuery, [postId]);
      await db.raw(insertQuery, [userId, postId]);
      await db.raw(commitQuery);

      return;
    } catch (error) {
      console.log('Failed to increment likes: ', error);
      throw error;
    }
  }

  static async decrementLikeCount(postId: number, userId: number) {
    try {
      const filePath = path.join(__dirname, '../scripts/decrementLikes.sql');
      const sqlQuery = await fs.readFileSync(filePath, 'utf-8');
      const [transQuery, updateQuery, deleteQuery, commitQuery] = sqlQuery.split(';').map((query: any) => query.trim());

      // can we not use a promise.all on the middle two?
      await db.raw(transQuery);
      await db.raw(updateQuery, [postId]);
      await db.raw(deleteQuery, [userId, postId]);
      await db.raw(commitQuery);
      //
      return;
    } catch (error) {
      console.log('Failed to decrement likes: ', error);
      throw error;
    }
  }

  static async incrementDislikeCount(postId: number, userId: number) {
    try {
      const filePath = path.join(__dirname, '../scripts/incrementDislikes.sql');
      const sqlQuery = await fs.readFileSync(filePath, 'utf-8');
      const [transQuery, updateQuery, insertQuery, commitQuery] = sqlQuery.split(';').map((query: any) => query.trim());

      // can we not use a promise.all on the middle two?
      await db.raw(transQuery);
      await db.raw(updateQuery, [postId]);
      await db.raw(insertQuery, [userId, postId]);
      await db.raw(commitQuery);
      return;
    } catch (error) {
      console.log('Failed to increment dislikes: ', error);
      throw error;
    }
  }

  static async decrementDislikeCount(postId: number, userId: number) {
    try {
      const filePath = path.join(__dirname, '../scripts/decrementDislikes.sql');
      const sqlQuery = await fs.readFileSync(filePath, 'utf-8');
      const [transQuery, updateQuery, deleteQuery, commitQuery] = sqlQuery.split(';').map((query: any) => query.trim());

      // can we not use a promise.all on the middle two?
      await db.raw(transQuery);
      await db.raw(updateQuery, [postId]);
      await db.raw(deleteQuery, [userId, postId]);
      await db.raw(commitQuery);

      return;
    } catch (error) {
      console.log('Failed to decrement dislikes: ', error);
      throw error;
    }
  }
}

export default PostService;
