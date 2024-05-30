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
      return userPosts;
    } catch (error) {
      console.log('Error fetching posts by username:', error);
    }
  }
}

export default PostService;
