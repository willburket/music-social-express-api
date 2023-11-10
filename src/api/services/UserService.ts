import db from '../../config/database'; 
import dotenv from 'dotenv';

class UserService {
    
    static async getUser(username: string) {
        try{
            // console.log(process.env.DB_USER)
            const res = await db('Users')
            .select('username','first_name','last_name','following_count','follower_count','bio')
            .where('username', username);

        return res
        } catch(error){
            console.log('Error fetching user:', error)
        }
    }
  
    // Other methods for creating, updating, and deleting users...
  }
  
  export default UserService;