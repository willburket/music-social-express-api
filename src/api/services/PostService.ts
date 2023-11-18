import db from '../../config/database'; 
import CreatePost from '../interfaces/CreatePost';

class PostService{
    static async createPost(post: CreatePost){
        try{
            // const hash = await bcrypt.hash(user.password,saltRounds);
            const dbPost = {
                username: post.username,
                user_id: post.userId,
                content: post.content,
                reply: post.reply,
            }
            
            const res = await db(process.env.POST_TABLE as string).insert(dbPost);
            const postId = res[0]
            const postObject = await db(process.env.POST_TABLE as string).where({id: postId}).select('*')
            
            return postObject[0] 
        }catch(error){
            console.log("Error saving user:",error);
            return     
        }
    }
}

export default PostService;