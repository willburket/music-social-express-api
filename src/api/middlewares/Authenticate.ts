import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'; 
import CurrentUser from '../interfaces/CurrentUser';
import AuthenticatedRequest from '../interfaces/AuthenticatedRequest';

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    const token = req.header('Authorization')
    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const user = jwt.verify(token, process.env.SECRET_KEY as string)
        const typedUser = user as CurrentUser;
        req.user = typedUser;
        
    } catch(error){
        return res.status(403).json({message: 'Forbidden'})
    }
    
    next();
    
}