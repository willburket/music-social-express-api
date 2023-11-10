import db from '../../config/database'; 
import AuthUser from '../interfaces/AuthUser';
import User from '../interfaces/User';
import SignUpUser from '../interfaces/SignUpUser';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config()

class UserService {
    
    static async getUser(username: string) {
        try{
            const res = await db(process.env.USER_TABLE as string)
            .select('username','first_name','last_name','following_count','follower_count','bio')
            .where('username', username);
        return res
        } catch(error){
            console.log('Error fetching user:', error)
        }
    }

    static async authorizeUser(user: AuthUser) {
        try{
            const res = await db(process.env.USER_TABLE as string).select('id','email','password_hash','username').where('email', user.email);
            const match = await bcrypt.compare(user.password, res[0].password_hash);
    
            if(!match) {
                // password incorrect
                return 
            }
            const payload = { userId: res[0].id, username: res[0].username };
            const token = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1h' });
            return token     
        }catch(error){
            console.log('Error checking user:', error)
        }
    }

    static async createUser(user: SignUpUser) {
        const saltRounds = 10;

    try{
        const hash = await bcrypt.hash(user.password,saltRounds);
        const dbUser = {
            first_name: user.first,
            last_name: user.last,
            username: user.username,
            email: user.email,
            bio: user.bio,
            password_hash: hash,
        }
        
        const userId = await db(process.env.USER_TABLE as string).insert(dbUser)
        const id = userId[0]
        
        const payload = { userId: id, username: user.username };
        
        const token = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1h' });
        return token 
    }catch(error){
        console.log("Error saving user:",error);
        return     
    }
    }
    static async getFollowingStatus(follower: string, followee: string) {
    
    }
  
  
  }
  
  export default UserService;