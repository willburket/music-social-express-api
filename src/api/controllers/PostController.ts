import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import PostService from "../services/PostService";
import { Request, Response } from 'express';
import CreatePost from "../interfaces/CreatePost";

class PostController {

    async createPost(req: AuthenticatedRequest, res: Response): Promise<void>{
        try{
            let newPost;
            const currentUser = req.user;
            const content = req.body.text;
           
            if (currentUser){
                const post: CreatePost = {
                    userId: currentUser.userId,
                    username: currentUser.username,
                    content: content,
                    reply: false,
                    replyTo: null,
                }
                console.log("Full Post:",post)
                newPost = await PostService.createPost(post)
            }
            res.status(200).json(newPost);
        }catch(error){
            res.status(500).json(error)
        }
    }
}

export default new PostController();