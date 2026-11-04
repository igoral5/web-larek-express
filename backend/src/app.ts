import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { DB_ADDRESS, PORT } from './config';
import router from './routes';
import { errorLogger, logger, requestLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/error-handlers';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);
app.use(router);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

const stopWithError = (message: string) => {
  logger.error(message);
  logger.on('finish', () => process.exit(1));
  logger.end();
};

const start = async () => {
  try {
    await mongoose.connect(DB_ADDRESS);
  } catch (error) {
    stopWithError(`Не удалось подключиться к MongoDB по адресу ${DB_ADDRESS}: ${(error as Error).message}`);
    return;
  }

  const server = app.listen(PORT, () => {
    logger.info(`Сервис успешно запущен на порту ${PORT}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    const message = error.code === 'EADDRINUSE'
      ? `Порт ${PORT} уже занят другим процессом`
      : `Ошибка запуска сервера: ${error.message}`;
    stopWithError(message);
  });
};

start();
