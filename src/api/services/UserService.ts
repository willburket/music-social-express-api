import db from '../../config/database'; 
import AuthUser from '../interfaces/AuthUser';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config()

class UserService {
    
    static async getUser(username: string) {
        try{
            const res = await db(process.env.DATABASE)
            .select('username','first_name','last_name','following_count','follower_count','bio')
            .where('username', username);
        return res
        } catch(error){
            console.log('Error fetching user:', error)
        }
    }

    static async authorizeUser(user: AuthUser){
        try{
            const res = await db(process.env.DATABASE).select('id','email','password_hash','username').where('email', user.email);
            const match = await bcrypt.compare(user.password, res[0].password_hash);
    
            if(!match) {
                // password incorrect
                return 
            }
            const payload = { userId: res[0].id, username: res[0].username };
            console.log("payload:", payload)
            const token = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1h' });
            return token     
        }catch(error){
            console.log('Error checking user:', error)
        }
    }

    static async getFollowingStatus(follower: string, followee: string){

    }
  
    // Other methods for creating, updating, and deleting users...
  }
  
  export default UserService;