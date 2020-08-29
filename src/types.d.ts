import * as http from 'http';
import { DecodedUser } from './services/auth';

declare module 'express-serve-static-core' {
  export interface Request extends Express.Request, http.IncomingMessage {
    decoded: DecodedUser;
  }
}
