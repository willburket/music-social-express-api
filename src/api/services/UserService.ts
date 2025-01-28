import db from '../../config/database';
import AuthUser from '../interfaces/AuthUser';
// import User from '../interfaces/User';
import CurrentUser from '../interfaces/CurrentUser';
import SignUpUser from '../interfaces/SignUpUser';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import FeedHelper from '../helpers/FeedHelper';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

import "@aws-sdk/signature-v4-crt";
import "@aws-sdk/crc64-nvme-crt";

dotenv.config();

const client = new S3Client({ region: process.env.AWS_REGION, 
  credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}
})

class UserService {
  static async getUser(username: string) {
    try {
      let res = await db(process.env.USER_TABLE as string)
        .select('id', 'username', 'first_name', 'last_name', 'following_count', 'follower_count', 'bio', 'winnings','profile_pic')
        .where('username', username);

      if(res[0].profile_pic !== null){
        res[0].profile_pic = await UserService.getProfilePic(res[0].profile_pic)
      }

      // get profile pic using profile_pic
      return res;
    } catch (error) {
      console.log('Error fetching user:', error);
    }
  }

  static async getUserById(id: any){
    try{
      let res = await db(process.env.USER_TABLE as string)
        .select('id', 'username', 'first_name', 'last_name', 'following_count', 'follower_count', 'bio', 'winnings','profile_pic')
        .where('id', id);

      if(res[0].profile_pic !== null){
        res[0].profile_pic = await UserService.getProfilePic(res[0].profile_pic)
      }

      // get profile pic using profile_pic
      return res;
    }catch(error){
      console.log("Error getting user by Id: ", error)
    }

  }



  static async authorizeUser(user: AuthUser) {
    try {
      const res = await db(process.env.USER_TABLE as string)
        .select('id', 'email', 'password_hash', 'username')
        .where('email', user.email);
      const match = await bcrypt.compare(user.password, res[0].password_hash);

      if (!match) {
        // password incorrect
        return;
      }
      const payload = { id: res[0].id, username: res[0].username };
      const token = jwt.sign(payload as CurrentUser, process.env.SECRET_KEY as string, { expiresIn: '1h' }); //update
      return token;
    } catch (error) {
      console.log('Error checking user:', error);
    }
  }

  static async createUser(user: SignUpUser) {
    const saltRounds: number = parseInt(process.env.SALT_ROUNDS as string, 10);

    try {
      const hash = await bcrypt.hash(user.password, saltRounds);
      const dbUser = {
        first_name: user.first,
        last_name: user.last,
        username: user.username,
        email: user.email,
        bio: user.bio,
        password_hash: hash,
      };

      const userId = await db(process.env.USER_TABLE as string).insert(dbUser);
      const id = userId[0];

      const payload = { id: id, username: user.username };

      const token = jwt.sign(payload as CurrentUser, process.env.SECRET_KEY as string, { expiresIn: '1h' });
      return token;
    } catch (error) {
      console.log('Error saving user:', error);
      return;
    }
  }

  static async getFollowStatus(follower: number, followee: number) {
    try {
      const followStatus = await db(process.env.FOLLOWER_TABLE as string).where({
        follower_id: follower,
        followee_id: followee,
      });

      if (followStatus[0] === undefined) {
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error checking follow status:', error);
    }
  }

  static async followUser(follower: number, followee: number) {
    const followObject = {
      follower_id: follower,
      followee_id: followee,
    };
    try {
      await db(process.env.FOLLOWER_TABLE as string).insert(followObject);
      await db(process.env.USER_TABLE as string)
        .where({ id: follower })
        .increment('following_count', 1);
      await db(process.env.USER_TABLE as string)
        .where({ id: followee })
        .increment('follower_count', 1);
    } catch (error) {
      console.log('Error following user:', error);
    }
  }

  static async unfollowUser(follower: number, followee: number) {
    try {
      await db(process.env.FOLLOWER_TABLE as string)
        .where({ follower_id: follower, followee_id: followee })
        .del();
      await db(process.env.USER_TABLE as string)
        .where({ id: follower })
        .decrement('following_count', 1);
      await db(process.env.USER_TABLE as string)
        .where({ id: followee })
        .decrement('follower_count', 1);
    } catch (error) {
      console.log('Error unfollowing user:', error);
    }
  }

  static async getFollowers(userId: number, page: number) {
    const itemCount = 10;
    const offset = page * itemCount;

    try {
      // this needs to be fixed
      const followers = await db(process.env.FOLLOWER_TABLE as string)
        .select('follower_id')
        .where({ followee_id: userId });
      const followerIds = followers.map((obj) => obj.follower_id);
      let followerObjects = await db(process.env.USER_TABLE as string)
        .select('id', 'first_name', 'last_name', 'bio', 'username', 'profile_pic')
        .whereIn('id', followerIds)
        .limit(itemCount)
        .offset(offset);

        for(let x = 0; x < followerObjects.length; x++){
          if(followerObjects[x].profile_pic){
            const url = await UserService.getProfilePic(followerObjects[x].profile_pic)
            followerObjects[x].profile_pic = url;
          }
        }

      return followerObjects;
    } catch (error) {
      console.log('Error getting followers:', error);
    }
  }

  static async getFollowing(userId: number, page: number) {
    const itemCount = 10;
    const offset = page * itemCount;

    try {
      const following = await db(process.env.FOLLOWER_TABLE as string)
        .select('followee_id')
        .where({ follower_id: userId });
      const followingIds = following.map((obj) => obj.followee_id);
      let followingObjects = await db(process.env.USER_TABLE as string)
        .select('id', 'first_name', 'last_name', 'bio', 'username', 'profile_pic')
        .whereIn('id', followingIds)
        .limit(itemCount)
        .offset(offset);

        for(let x = 0; x < followingObjects.length; x++){
          if(followingObjects[x].profile_pic){
            const url = await UserService.getProfilePic(followingObjects[x].profile_pic)
            followingObjects[x].profile_pic = url;
          }
        }


      return followingObjects;
    } catch (error) {
      console.log('Error getting following:', error);
    }
  }

  static async updateWinnings(userId: number, payout: number) {
    // add/subtract units from total winnings
  }

  static async getLikedPosts(userId: number, page: number) {
    try {
      let likedPosts = await FeedHelper.getLikedPosts(userId, page);

      for(let x = 0; x < likedPosts.length; x++){
        if(likedPosts[x].profile_pic){
          const url = await UserService.getProfilePic(likedPosts[x].profile_pic)
          likedPosts[x].profile_pic = url;
        }
      }
      
      return likedPosts;
    } catch (error) {
      throw error;
    }
  }

  static async getDislikedPosts(userId: number, page: number) {
    try {
      let dislikedPosts = await FeedHelper.getDislikedPosts(userId, page);

      for(let x = 0; x < dislikedPosts.length; x++){
        if(dislikedPosts[x].profile_pic){
          const url = await UserService.getProfilePic(dislikedPosts[x].profile_pic)
          dislikedPosts[x].profile_pic = url;
        }
      }
      return dislikedPosts;
    } catch (error) {
      throw error;
    }
  }

  static async editProfile(userId: number, newData: any) {
    try {
      await db(process.env.USER_TABLE as string)
        .where({ id: userId })
        .update(newData);

      const payload = { id: userId, username: newData.username };
      const token = jwt.sign(payload as CurrentUser, process.env.SECRET_KEY as string, { expiresIn: '1h' });
      return token;
    } catch (error) {
      console.log('edit prof:', error);
      throw error;
    }
  }

  static async getProfilePic(photoName: string){
    try{
        // should typically be called within other function while we're fetching feed/user data
        // needs to get photo id or whatever from user database
          // then fetch said id in S3 bucket 
        // we want to deliver everything to the front end ready to go probably 

        // signed url 
        // const command = new PutObjectCommand({Bucket: process.env.AWS_S3_BUCKET,Key: photoName, ACL: 'public-read', ContentType: "image/jpeg"});
        const command = new GetObjectCommand({Bucket: process.env.AWS_S3_BUCKET, Key: photoName});
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3000 });

      return signedUrl
    }catch(error){
      console.log("Error getting profile pic: ", error)
      throw error;
    }
  }

  static async getFeedProfilePics(feed: any[]){
    try{

    }catch(error){
      console.log("Error getting feed profile pics: ", error)
      throw error;
    }
  }
}

export default UserService;
