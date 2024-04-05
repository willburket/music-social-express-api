import { Request } from 'express';
import CurrentUser from './CurrentUser';

interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
}

export default AuthenticatedRequest;
