import { Response } from "express";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import FeedService from "../services/FeedService";

class FeedController{

    async getFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
        const id = req.user?.id
        const page = req.query.page;
        const pageNum: number = parseInt(page as string, 10);
        try{
            console.log("Page:",page)
            // const feed = null
          const feed = await FeedService.getFeed(id as number, pageNum)
          res.status(200).json(feed)
        }catch(error){
          res.status(500).json(error)
        }
      }

}

export default new FeedController();;