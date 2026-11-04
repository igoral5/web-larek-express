import { NextFunction, Request, Response } from 'express';
import { isCelebrateError } from 'celebrate';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const isHttpError = (error: unknown): error is BadRequestError | ConflictError | NotFoundError => (
  error instanceof BadRequestError
  || error instanceof ConflictError
  || error instanceof NotFoundError
);

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isCelebrateError(err)) {
    res.status(400).send({ message: err.details.get('body')?.message ?? err.message });
    return;
  }

  if (err instanceof MongooseError.ValidationError || err instanceof MongooseError.CastError) {
    res.status(400).send({ message: err.message });
    return;
  }

  if (err instanceof Error && err.message.includes('E11000')) {
    res.status(409).send({ message: 'Товар с таким названием уже существует' });
    return;
  }

  if (isHttpError(err)) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }

  res.status(500).send({ message: 'На сервере произошла ошибка' });
};
