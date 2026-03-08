import 'express';
import { JwtPayload } from './jwt-payload.type';

declare module 'express' {
  interface Request {
    employee?: JwtPayload;
  }
}
