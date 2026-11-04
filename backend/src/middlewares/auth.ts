import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export default (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }

  try {
    req.user = jwt.verify(authorization.slice(7), JWT_SECRET) as { _id: string };
    next();
  } catch {
    next(new UnauthorizedError('Необходима авторизация'));
  }
};
