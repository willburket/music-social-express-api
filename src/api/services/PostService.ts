import db from '../../config/database';
import CreatePost from '../interfaces/CreatePost';

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
      const postId = res[0];
      const postObject = await db(process.env.POST_TABLE as string)
        .where({ id: postId })
        .select('*');

      return postObject[0];
    } catch (error) {
      console.log('Error saving user:', error);
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

  static async getPostsByUsername(username: string) {
    try {
      const userPosts = await db(process.env.POST_TABLE as string)
        .where({ username: username })
        .select('*');

      // query tweet table, betslip table, bet table by user
      // use joins and index?
      // paginate by maybe 25 at a time?
      // we want to be able to populate posts/betslips all in one fetch from the frontend

      return userPosts;
    } catch (error) {
      console.log('Error fetching posts by username:', error);
    }
  }
}

export default PostService;
