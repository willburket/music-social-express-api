import { Request } from 'express';
import CurrentUser from './CurrentUser';

interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
  file?: Express.Multer.File;
}

export default AuthenticatedRequest;
